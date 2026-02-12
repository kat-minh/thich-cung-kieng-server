import { Bucket } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private readonly app: admin.app.App;
  constructor(private readonly config: ConfigService) {
    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.config.get<string>('firebase.admin.projectId'),
        clientEmail: this.config.get<string>('firebase.admin.clientEmail'),
        privateKey: this.config
          .get<string>('firebase.admin.privateKey')
          ?.replace(/\\n/g, '\n')
          ?.replace(/\\"/g, '"')
          ?.replace(/\\$/, ''),
      }),
      storageBucket: this.config.get<string>('firebase.admin.storageBucket'),
    });
  }
  getAuth() {
    return admin.auth();
  }

  getFirestore() {
    return admin.firestore();
  }

  getStorage(): Bucket {
    return admin.storage().bucket();
  }

  getMessaging() {
    return admin.messaging();
  }
}
