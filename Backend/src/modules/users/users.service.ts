import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmailOrUsername(identifier: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }]
    }).exec();
  }

  async create(createUserData: any): Promise<UserDocument> {
    const newUser = new this.userModel(createUserData);
    return newUser.save();
  }

  async listarTodos(): Promise<User[]> {
    const todos = await this.userModel.find().select('-password').exec();
    console.log('-> MONGO DEVOLVIÓ ESTA CANTIDAD DE USUARIOS:', todos.length); 
    return todos;
  }

  async cambiarEstado(id: string, estado: boolean): Promise<User> {
    const usuarioActualizado = await this.userModel
      .findByIdAndUpdate(id, { activo: estado }, { new: true })
      .select('-password')
      .exec();

    if (!usuarioActualizado) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuarioActualizado;
  }

  async crearDesdeAdmin(datos: any): Promise<any> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(datos.password, salt);

    const avatarUrl = datos.avatarUrl || '/uploads/avatars/default.png';

    const nuevoUsuario = new this.userModel({
      ...datos,
      password: hashedPassword,
      avatarUrl: avatarUrl,
      activo: true,
    });

    const usuarioGuardado = await nuevoUsuario.save();
    const objetoUsuario = usuarioGuardado.toObject();
    
    delete (objetoUsuario as any).password;

    return objetoUsuario;
  }
}