import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  reset_password_token: string;

  @Column({ nullable: true })
  reset_password_token_time: string;
}
