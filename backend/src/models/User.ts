import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'editor' | 'viewer';
  googleId?: string;
  avatar?: string;
  workspaces: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function(this: IUser) {
        return !this.googleId;
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'editor', 'viewer'],
      default: 'viewer',
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    avatar: {
      type: String,
    },
    workspaces: [{
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
    }],
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });

export default mongoose.model<IUser>('User', UserSchema);
