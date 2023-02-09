import Address from "../../../@shared/domain/value-object/address.value-object";
import Id from "../../../@shared/domain/value-object/id.value-object";
import Invoice from "../../domain/invoice.entity";
import Product from "../../domain/product.entity";
import { FindInvoiceUseCaseInputDTO, FindInvoiceUseCaseOutputDTO } from "./find-invoice.dto";
import FindInvoiceUseCase from "./find-invoice.usecase";

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
    zipCode: '12345678',
  }),
  items: [
    new Product({
      id: new Id('1'),
      name: 'Product 1',
      price: 10,
    }),
    new Product({
      id: new Id('2'),
      name: 'Product 2',
      price: 20,
    }),
  ],
});

const MockRepository = () => {
  return {
    add: jest.fn(),
    find: jest.fn().mockReturnValue(invoice),
  };
};

describe('FindInvoiceUseCase', () => {
  it('should find an invoice by id', async () => {
    const invoiceRepository = MockRepository();
    const usecase = new FindInvoiceUseCase(invoiceRepository);

    const input: FindInvoiceUseCaseInputDTO = {
      id: '1',
    }

    const output: FindInvoiceUseCaseOutputDTO = await usecase.execute(input);

    expect(invoiceRepository.find).toHaveBeenCalled();

    expect(output).toEqual({
      id: invoice.id.id,
      name: invoice.name,
      document: invoice.document,
      address: {
        street: invoice.address.street,
        number: invoice.address.number,
        complement: invoice.address.complement,
        city: invoice.address.city,
        state: invoice.address.state,
        zipCode: invoice.address.zipCode,
      },
      items: invoice.items.map((item: Product) => ({
        id: item.id.id,
        name: item.name,
        price: item.price,
      })),
      total: invoice.items.reduce((total: number, item: Product) => total + item.price, 0),
      createdAt: invoice.createdAt,
    });
  });
});