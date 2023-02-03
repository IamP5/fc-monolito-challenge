import Address from "../../domain/address.valueobject";
import Invoice from "../../domain/invoice.entity";
import Product from "../../domain/product.entity";
import { GenerateInvoiceUseCaseInputDto } from "./generate-invoice.dto";
import GenerateInvoiceUseCase from "./generate-invoice.usecase";

describe('GenerateInvoiceUseCase', () => {

  const mockRepository = {
    add: jest.fn().mockReturnValue(Promise.resolve()),
    find: jest.fn(),
  };

  const input: GenerateInvoiceUseCaseInputDto = {
    name: 'John Doe',
    document: '12345678910',
    street: 'Street',
    number: '123',
    complement: 'Complement',
    city: 'City',
    state: 'State',
    zipCode: '12345678',
    items: [
      {
        id: '1',
        name: 'Product 1',
        price: 10,
      },
      {
        id: '2',
        name: 'Product 2',
        price: 20,
      },
    ],
  };

  it('should generate invoice', async () => {
    const useCase = new GenerateInvoiceUseCase(mockRepository);

    const output = await useCase.execute(input);

    expect(mockRepository.add).toBeCalled();
    expect(output).toEqual({
      id: expect.any(String),
      name: input.name,
      document: input.document,
      street: input.street,
      number: input.number,
      complement: input.complement,
      city: input.city,
      state: input.state,
      zipCode: input.zipCode,
      items: input.items.map((item) => ({
        id: expect.any(String),
        name: item.name,
        price: item.price,
      })),
      total: 30,
    });
  });
});