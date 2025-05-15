import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway(3001)
export class BroadcastGateway {

  @WebSocketServer() server: Server;

  private streams: Map<string, { broadcasterId: string, viewerIds: string[] }> = new Map();
  private socketToStream: Map<string, string> = new Map();

  @SubscribeMessage('createStream')
  handleCreateStream(@ConnectedSocket() client: Socket): void {
    const streamId = uuidv4();
    this.streams.set(streamId, { broadcasterId: client.id, viewerIds: [] });
    this.socketToStream.set(client.id, streamId);
    client.emit('streamCreated', { streamLink: `/viewer/${streamId}` });
  }

  @SubscribeMessage('joinStream')
  handleJoinStream(@ConnectedSocket() client: Socket, @MessageBody() data: { streamId: string }): void {
    const stream = this.streams.get(data.streamId);
    if (stream && stream.broadcasterId) {
      stream.viewerIds.push(client.id);
      this.socketToStream.set(client.id, data.streamId);
      client.emit('joinedStream', { broadcasterId: stream.broadcasterId });
      this.server.to(stream.broadcasterId).emit('viewerJoined', { viewerId: client.id });
    } else {
      client.emit('streamNotFound');
    }
  }

  @SubscribeMessage('offer')
  handleOffer(@ConnectedSocket() client: Socket, @MessageBody() data: { targetId: string, offer: any }): void {
    this.server.to(data.targetId).emit('offer', { offer: data.offer, from: client.id });
  }

  @SubscribeMessage('answer')
  handleAnswer(@ConnectedSocket() client: Socket, @MessageBody() data: { targetId: string, answer: any }): void {
    this.server.to(data.targetId).emit('answer', { answer: data.answer, from: client.id });
  }

  @SubscribeMessage('candidate')
  handleCandidate(@ConnectedSocket() client: Socket, @MessageBody() data: { targetId: string, candidate: any }): void {
    this.server.to(data.targetId).emit('candidate', { candidate: data.candidate, from: client.id });
  }


  handleDisconnect(@ConnectedSocket() client: Socket): void {
    const streamId = this.socketToStream.get(client.id);
    if (streamId) {
      const stream = this.streams.get(streamId);
      if (stream) {
        if (stream.broadcasterId === client.id) {
          // Broadcaster disconnected
          this.streams.delete(streamId);
          stream.viewerIds.forEach(viewerId => {
            this.server.to(viewerId).emit('broadcastEnded');
            this.socketToStream.delete(viewerId);
          });
          this.socketToStream.delete(client.id);
        } else {
          // Viewer disconnected
          const viewerIndex = stream.viewerIds.indexOf(client.id);
          if (viewerIndex > -1) {
            stream.viewerIds.splice(viewerIndex, 1);
            this.socketToStream.delete(client.id);
            this.server.to(stream.broadcasterId).emit('viewerLeft', { viewerId: client.id });
          }
        }
      }
    }
  }
}