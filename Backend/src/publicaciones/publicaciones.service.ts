import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>
  ) {}

  async crear(data: any, usuarioId: string) {
    const nueva = new this.publicacionModel({
      ...data,
      usuarioId: new Types.ObjectId(usuarioId)
    });
    return nueva.save();
  }

  async listar(orden: 'fecha' | 'likes', usuarioId?: string, limit: number = 10, offset: number = 0) {
    const query: any = { activo: true };
    if (usuarioId) {
      query.usuarioId = new Types.ObjectId(usuarioId);
    }

    let sortOption: any = { createdAt: -1 };
    if (orden === 'likes') {
      sortOption = { likesCount: -1, createdAt: -1 };
    }

    const resultados = await this.publicacionModel.aggregate([
      { $match: query },
      { $addFields: { likesCount: { $size: '$likes' } } },
      { $sort: sortOption },
      { $skip: offset },
      { $limit: limit },
      {
        $lookup: {
          from: 'usuarios', 
          localField: 'usuarioId',
          foreignField: '_id',
          as: 'usuario'
        }
      },
      { $unwind: '$usuario' }
    ]);

    return resultados;
  }

  async verificarDuenio(pubId: string, usrId: string): Promise<boolean> {
    const pub = await this.publicacionModel.findById(pubId);
    return pub && pub.usuarioId.toString() === usrId;
  }

  async bajaLogica(id: string) {
    return this.publicacionModel.findByIdAndUpdate(id, { activo: false });
  }

  async agregarLike(pubId: string, usrId: string) {
    const pub = await this.publicacionModel.findById(pubId);
    if (!pub) throw new NotFoundException('No existe la publicación');
    
    if (pub.likes.some(id => id.toString() === usrId)) {
      throw new BadRequestException('Ya le diste like');
    }

    pub.likes.push(new Types.ObjectId(usrId));
    return pub.save();
  }

  async removerLike(pubId: string, usrId: string) {
    const pub = await this.publicacionModel.findById(pubId);
    if (!pub) throw new NotFoundException('No existe la publicación');

    pub.likes = pub.likes.filter(id => id.toString() !== usrId) as any;
    return pub.save();
  }
}