import { BelongsToMany, Model } from "sequelize-typescript";
import { Column, HasMany, PrimaryKey, Table } from "sequelize-typescript";
import { InvoiceProductsModel } from "../invoice-products/invoice-products.model";
import { ProductModel } from "../product/product.model";

@Table({
  tableName: "invoices",
})
export default class InvoiceModel extends Model {
  @PrimaryKey
  @Column({ allowNull: false })
  id: string;

  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: false })
  document: string;

  @Column({ allowNull: false })
  street: string;

  @Column({ allowNull: false })
  number: string;

  @Column({ allowNull: false })
  complement: string;

  @Column({ allowNull: false })
  city: string;

  @Column({ allowNull: false })
  state: string;

  @Column({ allowNull: false })
  zipCode: string;

  @BelongsToMany(() => ProductModel, {
    through: { model: () => InvoiceProductsModel },
  })
  items: ProductModel[];

  @HasMany(() => InvoiceProductsModel, {
    onDelete: "CASCADE",
  })
  userRoles!: InvoiceProductsModel[];

  @Column({ allowNull: false })
  createdAt: Date;

  @Column({ allowNull: false })
  updatedAt: Date;
}