import Client, { AuthRecord, RecordModel } from 'pocketbase';

export interface UserSignup {
  email: string;
  password: string;
  username: string;
}

export interface CreatedUser {
  id: string;
  email: string;
  username: string;
}

export interface LoginResponse {
  token: string;
  record: any;
}

export interface IUserService {
  getUserById(id: string): Promise<RecordModel | null>;
  getUsersByIds(ids: string[]): Promise<Array<RecordModel>>;
  createUser(signup: UserSignup): Promise<CreatedUser>;
  signInUser(email: string, password: string): Promise<{ user: any; token: string }>;
  validateToken(token: string): Promise<AuthRecord | null>;
}

export class UserService implements IUserService {
  constructor(private pb: Client) {
    console.log(process.env.POCKETBASE_URL)
  }

  async getUserById(id: string): Promise<RecordModel | null> {
    try {
      const user = await this.pb
        .collection('users')
        .getOne(id, { fields: 'id,name,avatar' });

      return user;
    } catch (err: unknown) {
      console.error(`Failed to fetch user ${id} from PocketBase:`, err);
      return null;
    }
  }

  async getUsersByIds(ids: string[]): Promise<Array<RecordModel>> {
    if (ids.length === 0) return [];

    const filter = `id~"${ids.join(',')}"`; // "~" works like "IN"

    try {
      const users = await this.pb.collection('users').getFullList({
        filter,
        fields: 'id,name,avatar',
      });

      return users;
    } catch (err: unknown) {
      console.error(`Failed to fetch users from PocketBase:`, err);
      return [];
    }
  }

  /**
   * Creates a new user in PocketBase
   * @param signup - User signup data including email, password, and username
   * @returns The created user object with id, email, and username
   * @throws Error if the creation fails (e.g., email already exists, invalid data)
   */
  public async createUser(signup: UserSignup): Promise<CreatedUser> {
    try {
      const recordModel = await this.pb.collection("users").create({
        email: signup.email,
        password: signup.password,
        passwordConfirm: signup.password,
        username: signup.username,
      });

      return {
        id: recordModel.id,
        email: recordModel.email,
        username: recordModel.username,
      };
    } catch (error: any) {
      console.error("Error creating user in PocketBase:", error?.message || error);
      throw new Error(error?.message || "Failed to create user");
    }
  }

  /**
   * Logs in a user with email and password
   * @param email - user's email
   * @param password - user's password
   * @returns {Promise<{ user: any, token: string }>} - user record and JWT token
   */
  async signInUser(email: string, password: string): Promise<{ user: any; token: string }> {
    try {
      // Authenticate with PocketBase using identity (email) + password
      const authData = await this.pb.collection("users").authWithPassword(email, password);

      // authData includes both token and user record
      const token = authData.token;
      const user = authData.record;

      console.log("User signed in:", user.email);

      return { user, token };
    } 
    catch (err: any) {
      console.error("Login failed:", err.message);
      throw new Error("Invalid email or password");
    }
  }

  /**
   * Validates a PocketBase user token using the native SDK
   * @param token - JWT token to validate
   * @returns The authenticated user record if valid, or null if invalid/expired
   */
  public async validateToken(token: string): Promise<AuthRecord | null> {
    try {
      // Load the token into PocketBase auth store
      this.pb.authStore.save(token, null);

      // Check if the token is still valid
      await this.pb.collection("users").authRefresh(); // refreshes user session

      // If successful, pb.authStore.model contains the user record
      return this.pb.authStore.record;
    } 
    catch (err: any) {
      console.error("Token validation failed:", err?.message || err);
      return null;
    }
  }
}
