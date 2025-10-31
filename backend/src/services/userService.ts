import Client, { RecordModel } from 'pocketbase';

export interface IUserService {
  getUserById(id: string): Promise<RecordModel | null>;
  getUsersByIds(ids: string[]): Promise<Array<RecordModel>>;
}

export class UserService implements IUserService {
  constructor(private pb: Client) {}

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
}
