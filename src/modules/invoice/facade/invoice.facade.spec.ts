import { Sequelize } from "sequelize-typescript";
import InvoiceFacadeFactory from "../factory/facade.factory";
import { InvoiceProductsModel } from "../repository/invoice-products/invoice-products.model";
import InvoiceModel from "../repository/invoice/invoice.model";
import { ProductModel } from "../repository/product/product.model";
import { FindInvoiceFacadeInputDto, GenerateInvoiceFacadeInputDto } from "./invoice-facade.interface";

describe("InvoiceFacadeTest", () => {
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
  it("should generate an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();

    const input: GenerateInvoiceFacadeInputDto = {
      name: "John Doe",
      document: "12345678901",
      street: "Street",
      number: "123",
      complement: "Complement",
      city: "City",
      state: "State",
      zipCode: "12345678",
      items: [
        {
          id: "1",
          name: "Product 1",
          price: 100,
        },
        {
          id: "2",
          name: "Product 2",
          price: 200,
        },
      ],
    };

    const output = await facade.generate(input);

    expect(output.id).toBeDefined();
    expect(output.name).toBe(input.name);
    expect(output.document).toBe(input.document);
    expect(output.street).toBe(input.street);
    expect(output.number).toBe(input.number);
    expect(output.complement).toBe(input.complement);
    expect(output.city).toBe(input.city);
    expect(output.state).toBe(input.state);
    expect(output.zipCode).toBe(input.zipCode);
    expect(output.items.length).toBe(2);
    expect(output.items[0].id).toBeDefined();
    expect(output.items[0].name).toBe(input.items[0].name);
    expect(output.items[0].price).toBe(input.items[0].price);
    expect(output.items[1].id).toBeDefined();
    expect(output.items[1].name).toBe(input.items[1].name);
    expect(output.items[1].price).toBe(input.items[1].price);
    expect(output.total).toBe(input.items.reduce((total, item) => total + item.price, 0));
  });

  it("should find an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();

    const invoice = await InvoiceModel.create({
      id: "1",
      name: "John Doe",
      document: "12345678901",
      street: "Street",
      number: "123",
      complement: "Complement",
      city: "City",
      state: "State",
      zipCode: "12345678",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const input: FindInvoiceFacadeInputDto = {
      id: "1",
    };

    const output = await facade.find(input);

    expect(output.id).toBe(invoice.id);
    expect(output.name).toBe(invoice.name);
    expect(output.document).toBe(invoice.document);
    expect(output.address.street).toBe(invoice.street);
    expect(output.address.number).toBe(invoice.number);
    expect(output.address.complement).toBe(invoice.complement);
    expect(output.address.city).toBe(invoice.city);
    expect(output.address.state).toBe(invoice.state);
    expect(output.address.zipCode).toBe(invoice.zipCode);
    expect(output.createdAt).toStrictEqual(invoice.createdAt);
  });

  it("should throw an error when invoice not found", async () => {
    const facade = InvoiceFacadeFactory.create();

    const input: FindInvoiceFacadeInputDto = {
      id: "1",
    };

    await expect(facade.find(input)).rejects.toThrow("Invoice not found");
  });
});