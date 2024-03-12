import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { AaaService } from './aaa.service';
import { CreateAaaDto } from './dto/create-aaa.dto';
import { UpdateAaaDto } from './dto/update-aaa.dto';
import { Observable } from 'rxjs';
import { Server } from 'socket.io';

@WebSocketGateway()
export class AaaGateway {
  constructor(private readonly aaaService: AaaService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createAaa')
  create(@MessageBody() createAaaDto: CreateAaaDto) {
    this.server.emit('wangyibo', 888);
    return this.aaaService.create(createAaaDto);
  }

  @SubscribeMessage('findAllAaa')
  findAll() {
    // return this.aaaService.findAll();
    // return {
    //   event: 'wangyibo',
    //   data: this.aaaService.findAll(),
    // };
    return new Observable((observer) => {
      observer.next({ event: 'wangyibo', data: { msg: 'aaa' } });

      setTimeout(() => {
        observer.next({ event: 'wangyibo', data: { msg: 'bbb' } });
      }, 2000);

      setTimeout(() => {
        observer.next({ event: 'wangyibo', data: { msg: 'ccc' } });
      }, 5000);
    });
  }

  @SubscribeMessage('findOneAaa')
  findOne(@MessageBody() id: number, @ConnectedSocket() server: Server) {
    server.emit('wangyibo', 666);
    return this.aaaService.findOne(id);
  }

  @SubscribeMessage('updateAaa')
  update(@MessageBody() updateAaaDto: UpdateAaaDto) {
    return this.aaaService.update(updateAaaDto.id, updateAaaDto);
  }

  @SubscribeMessage('removeAaa')
  remove(@MessageBody() id: number) {
    return this.aaaService.remove(id);
  }
}
