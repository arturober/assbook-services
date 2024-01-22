import { Module } from '@nestjs/common';
import { ImageService } from './image/image.service';
import { FirebaseService } from './firebase/firebase.service';

@Module({
  providers: [
    ImageService,
    FirebaseService,
    {
      provide: 'BING_TOKEN',
      useValue:
        'An8JNymYeoGzMUqXfVJlMm_9CLeMcpx_5NB0N1G9cUEUxIadv7XX5zVc008au1N1',
    },
  ],
  exports: [ImageService, FirebaseService, 'BING_TOKEN'],
})
export class CommonsModule {}
