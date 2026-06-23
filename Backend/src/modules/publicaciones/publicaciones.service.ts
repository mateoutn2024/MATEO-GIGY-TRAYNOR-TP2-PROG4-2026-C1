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
    console.log("¡EL BACKEND PASÓ POR ACÁ!");
      try {
        const nueva = new this.publicacionModel({
          titulo: data.titulo || data.title,
          descripcion: data.descripcion || data.description,
          imagenUrl: data.imagenUrl || data.imageUrl || '',
          usuarioId: new Types.ObjectId(usuarioId),
          likes: [],
          activo: true
        });
        
        return await nueva.save();
      } catch (error) {
        console.error("====== ERROR DETALLADO DE MONGOOSE ======", error);
        throw error; 
      }
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
          from: 'users',
          localField: 'usuarioId',
          foreignField: '_id',
          as: 'usuario'
        }
      },
      { 
        $unwind: { 
          path: '$usuario', 
          preserveNullAndEmptyArrays: true 
        } 
      }    ]);

    return resultados;
  }

  async verificarDuenio(pubId: string, usrId: string): Promise<boolean> {
      const pub = await this.publicacionModel.findById(pubId);
      if (!pub) return false;

      const idCreadorPost = pub.usuarioId?._id 
        ? pub.usuarioId._id.toString() 
        : pub.usuarioId?.toString();

      const idUsuarioLogueado = usrId ? usrId.toString() : '';

      return idCreadorPost === idUsuarioLogueado;
    }

  async bajaLogica(id: string) {
    return this.publicacionModel.findByIdAndUpdate(id, { activo: false });
  }

async agregarLike(pubId: string, usrId: string) {
    if (!usrId) throw new BadRequestException('El ID de usuario es requerido.');

    // 🌟 Usamos findByIdAndUpdate con $addToSet para que NUNCA se duplique tu ID
    const pub = await this.publicacionModel.findByIdAndUpdate(
      pubId,
      { $addToSet: { likes: new Types.ObjectId(usrId) } },
      { returnDocument: 'after' }
    );

    if (!pub) throw new NotFoundException('No existe la publicación');
    return pub;
  }

  async removerLike(pubId: string, usrId: string) {
    if (!usrId) throw new BadRequestException('El ID de usuario es requerido.');

    // 🌟 Usamos findByIdAndUpdate con $pull para remover TODAS las instancias de ese ID de un saque
    const pub = await this.publicacionModel.findByIdAndUpdate(
      pubId,
      { $pull: { likes: new Types.ObjectId(usrId) } },
      { returnDocument: 'after' }
    );

    if (!pub) throw new NotFoundException('No existe la publicación');
    return pub;
  }}