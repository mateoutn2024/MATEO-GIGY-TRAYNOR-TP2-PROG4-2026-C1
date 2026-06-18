import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  username!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true })
  birthDate!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ required: true })
  avatarUrl!: string;

  @Prop({ required: true, enum: ['usuario', 'administrador'], default: 'usuario' })
  role!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);