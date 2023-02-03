import { BelongsToMany, Column, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { InvoiceProductsModel } from "../invoice-products/invoice-products.model";
import InvoiceModel from "../invoice/invoice.model";

@Table({
  tableName: "products",
  timestamps: false,
})
export class ProductModel extends Model {
  @PrimaryKey
  @Column({ allowNull: false })
  id: string;

  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: false })
  price: number;

  @Column({ allowNull: false })
  createdAt: Date;

  @Column({ allowNull: false })
  updatedAt: Date;

  @BelongsToMany(() => InvoiceModel, {
    through: { model: () => InvoiceProductsModel },
  })
  users!: InvoiceModel[];

  @HasMany(() => InvoiceProductsModel, {
    onDelete: "CASCADE",
  })
  userRoles!: InvoiceProductsModel[];
}