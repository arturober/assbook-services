import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor() {}

  async sendMessage(token: string, title: string, body: string, data: any) {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      token,
    };

    try {
      const resp = await admin.messaging().send(message);
      return resp;
    } catch (e) {
      return null;
    }
  }
}
