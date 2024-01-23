import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  password: string;
}
