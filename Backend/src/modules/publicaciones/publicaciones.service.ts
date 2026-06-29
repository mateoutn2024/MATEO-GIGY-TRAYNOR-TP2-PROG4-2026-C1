import { Injectable,ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async eliminarPublicacion(idPublicacion: string, idUsuarioLogueado: string, rolUsuario: string) {
      const publicacion = await this.publicacionModel.findById(idPublicacion);
      
      if (!publicacion) {
        throw new NotFoundException('La publicación no existe');
      }

      const idCreador = publicacion.usuarioId ? publicacion.usuarioId.toString() : 'vacio';
      const idLogueado = idUsuarioLogueado ? idUsuarioLogueado.toString() : 'desconocido';

      const esAdmin = rolUsuario === 'admin' || rolUsuario === 'administrador';

      if (idCreador !== idLogueado && !esAdmin) {
        throw new ForbiddenException(`Sin permisos. Dueño: ${idCreador} | Vos: ${idLogueado}`);
      }

      return await this.publicacionModel.findByIdAndDelete(idPublicacion);
    }

  async listar(orden: 'fecha' | 'likes', usuarioId?: string, limit: number = 10, offset: number = 0) {
    try {
      const query: any = { activo: true };
      if (usuarioId) query.usuarioId = new Types.ObjectId(usuarioId);

      const resultados = await this.publicacionModel.find(query)
        .sort(orden === 'likes' ? { likesCount: -1 } : { createdAt: -1 })
        .skip(Number(offset))
        .limit(Number(limit))
        .populate('usuarioId', 'firstName lastName') 
        .exec();

      return resultados;
    } catch (error) {
      console.error("ERROR CRÍTICO EN LISTAR:", error);
      throw error;
    }
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

    const pub = await this.publicacionModel.findByIdAndUpdate(
      pubId,
      { $pull: { likes: new Types.ObjectId(usrId) } },
      { returnDocument: 'after' }
    );

    if (!pub) throw new NotFoundException('No existe la publicación');
    return pub;
  }

  async agregarComentario(pubId: string, mensaje: string, usrId: string) {
    return this.publicacionModel.findByIdAndUpdate(
      pubId,
      { 
        $push: { 
          comentarios: {
            _id: new Types.ObjectId(),
            usuarioId: new Types.ObjectId(usrId),
            mensaje,
            modificado: false,
            createdAt: new Date()
          } 
        } 
      },
      { returnDocument: 'after' }
    );
  }

  async modificarComentario(pubId: string, comentarioId: string, nuevoMensaje: string) {
    return this.publicacionModel.updateOne(
      { _id: new Types.ObjectId(pubId), "comentarios._id": new Types.ObjectId(comentarioId) },
      { 
        $set: { 
          "comentarios.$.mensaje": nuevoMensaje,
          "comentarios.$.modificado": true 
        } 
      }
    );
  }

  async obtenerComentariosPaginados(pubId: string, limit: number, offset: number) {
    const pub = await this.publicacionModel.findById(pubId)
      .populate('comentarios.usuarioId') 
      .exec();

    if (!pub || !pub.comentarios) return [];

    const comentariosOrdenados = pub.comentarios.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return comentariosOrdenados.slice(offset, offset + limit);
  }
}