import { Sequelize } from "sequelize-typescript";
import Id from "../../../@shared/domain/value-object/id.value-object";
import Address from "../../domain/address.valueobject";
import Invoice from "../../domain/invoice.entity";
import Product from "../../domain/product.entity";
import { InvoiceProductsModel } from "../invoice-products/invoice-products.model";
import { ProductModel } from "../product/product.model";
import InvoiceModel from "./invoice.model";
import InvoiceRepository from "./invoice.repository";

describe('InvoiceRepositoryTests', () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([InvoiceModel, ProductModel, InvoiceProductsModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  const invoice = new Invoice({
    id: new Id('1'),
    name: 'Invoice 1',
    document: '123456789',
    address: new Address({
      street: 'Street 1',
      number: '1',
      complement: 'Complement 1',
      city: 'City 1',
      state: 'State 1',
      zipCode: '123456',
    }),
    items: [
      new Product({
        id: new Id('1'),
        name: 'Product 1',
        price: 100,
      }),
      new Product({
        id: new Id('2'),
        name: 'Product 2',
        price: 200,
      }),
    ],
  });

  it('should add an invoice', async () => {
    const invoiceRepository = new InvoiceRepository();
    await invoiceRepository.add(invoice);

    const invoiceDb = await InvoiceModel.findOne({
      where: { id: invoice.id.id },
      include: {
        model: ProductModel,
        through: { attributes: [] },
      }
    });

    expect(invoiceDb.id).toEqual(invoice.id.id);
    expect(invoiceDb.name).toEqual(invoice.name);
    expect(invoiceDb.document).toEqual(invoice.document);
    expect(invoiceDb.street).toEqual(invoice.address.street);
    expect(invoiceDb.number).toEqual(invoice.address.number);
    expect(invoiceDb.complement).toEqual(invoice.address.complement);
    expect(invoiceDb.city).toEqual(invoice.address.city);
    expect(invoiceDb.state).toEqual(invoice.address.state);
    expect(invoiceDb.zipCode).toEqual(invoice.address.zipCode);
    expect(invoiceDb.items.length).toEqual(invoice.items.length);
    expect(invoiceDb.items[0].id).toEqual(invoice.items[0].id.id);
    expect(invoiceDb.items[0].name).toEqual(invoice.items[0].name);
    expect(invoiceDb.items[0].price).toEqual(invoice.items[0].price);
    expect(invoiceDb.items[1].id).toEqual(invoice.items[1].id.id);
    expect(invoiceDb.items[1].name).toEqual(invoice.items[1].name);
    expect(invoiceDb.items[1].price).toEqual(invoice.items[1].price);
  });

  it('should find an invoice by id', async () => {
    const invoiceRepository = new InvoiceRepository();

    await InvoiceModel.create({
      id: invoice.id.id,
      name: invoice.name,
      document: invoice.document,
      street: invoice.address.street,
      number: invoice.address.number,
      complement: invoice.address.complement,
      city: invoice.address.city,
      state: invoice.address.state,
      zipCode: invoice.address.zipCode,
      items: invoice.items.map((item) => ({
        id: item.id.id,
        name: item.name,
        price: item.price,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    }, {
      include: { model: ProductModel }
    });

    const invoiceFound = await invoiceRepository.find(invoice.id.id);

    expect(invoiceFound.id.id).toEqual(invoice.id.id);
    expect(invoiceFound.name).toEqual(invoice.name);
    expect(invoiceFound.document).toEqual(invoice.document);
    expect(invoiceFound.address.street).toEqual(invoice.address.street);
    expect(invoiceFound.address.number).toEqual(invoice.address.number);
    expect(invoiceFound.address.complement).toEqual(invoice.address.complement);
    expect(invoiceFound.address.city).toEqual(invoice.address.city);
    expect(invoiceFound.address.state).toEqual(invoice.address.state);
    expect(invoiceFound.address.zipCode).toEqual(invoice.address.zipCode);
    expect(invoiceFound.items.length).toEqual(invoice.items.length);
    expect(invoiceFound.items[0].id.id).toEqual(invoice.items[0].id.id);
    expect(invoiceFound.items[0].name).toEqual(invoice.items[0].name);
    expect(invoiceFound.items[0].price).toEqual(invoice.items[0].price);
    expect(invoiceFound.items[0].createdAt).toBeDefined();
    expect(invoiceFound.items[0].updatedAt).toBeDefined();
    expect(invoiceFound.items[1].id.id).toEqual(invoice.items[1].id.id);
    expect(invoiceFound.items[1].name).toEqual(invoice.items[1].name);
    expect(invoiceFound.items[1].price).toEqual(invoice.items[1].price);
    expect(invoiceFound.items[1].createdAt).toBeDefined();
    expect(invoiceFound.items[1].updatedAt).toBeDefined();
    expect(invoiceFound.createdAt).toBeDefined();
    expect(invoiceFound.updatedAt).toBeDefined();
  });

  it('should throw an error when invoice not found', async () => {
    const invoiceRepository = new InvoiceRepository();

    await expect(invoiceRepository.find('1')).rejects.toThrowError("Invoice not found");
  });
});