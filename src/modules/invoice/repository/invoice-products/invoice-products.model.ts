import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import InvoiceModel from "../invoice/invoice.model";
import { ProductModel } from "../product/product.model";

@Table({
  tableName: "invoice_products",
  timestamps: false,
})
export class InvoiceProductsModel extends Model {
  @BelongsTo(() => InvoiceModel)
  invoice: InvoiceModel;

  @ForeignKey(() => InvoiceModel)
  @PrimaryKey
  @Column({ allowNull: false })
  invoiceId: string;

  @BelongsTo(() => ProductModel)
  product: ProductModel;

  @ForeignKey(() => ProductModel)
  @PrimaryKey
  @Column({ allowNull: false })
  productId: string;
}