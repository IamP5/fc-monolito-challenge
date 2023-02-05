import Id from "../../../@shared/domain/value-object/id.value-object";
import Product from "../../domain/product.entity";
import { PlaceOrderInputDto } from "./place-order.dto";
import PlaceOrderUseCase from "./place-order.usecase";

const mockDate = new Date(2021, 1, 1, 0, 0, 0, 0);
describe('PlaceOrderUseCaseTest', () => {
  describe('validateProductsTest', () => {
    //@ts-expect-error - no params in constructor
    const placeOrderUseCase = new PlaceOrderUseCase();

    it('should throw an error when no products selected', () => {
      const input: PlaceOrderInputDto = {
        clientId: '0',
        products: [],
      }

      expect(() => placeOrderUseCase["validateProducts"](input))
        .rejects
        .toThrowError('No products selected');
    });

    it('should throw an error when product is out of stock', async () => {
      const mockProductFacade = {
        checkStock: jest.fn(({ productId }: { productId: string }) =>
          Promise.resolve({
            productId,
            stock: productId === "1" ? 0 : 1,
          })
        )
      };

      //@ts-expect-error - force set productFacade
      placeOrderUseCase["_productFacade"] = mockProductFacade;

      let input: PlaceOrderInputDto = {
        clientId: '0',
        products: [{ productId: '1' }],
      }

      await expect(() => placeOrderUseCase["validateProducts"](input))
        .rejects
        .toThrowError('Product 1 is not available in stock');

      input = {
        clientId: '0',
        products: [{ productId: '0' }, { productId: '1' }],
      }

      await expect(() => placeOrderUseCase["validateProducts"](input))
        .rejects
        .toThrowError('Product 1 is not available in stock');

      expect(mockProductFacade.checkStock).toBeCalledTimes(3);
    });
  });

  describe('getProductsTest', () => {
    beforeAll(() => {
      jest.useFakeTimers("modern");
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should throw an error when product not found', async () => {
      const mockCatalogFacade = {
        find: jest.fn().mockResolvedValue(null),
      }

      //@ts-expect-error - no params in constructor
      const placeOrderUseCase = new PlaceOrderUseCase();

      //@ts-expect-error - force set catalogFacade
      placeOrderUseCase["_catalogFacade"] = mockCatalogFacade;

      await expect(placeOrderUseCase["getProduct"]('0'))
        .rejects
        .toThrowError('Product not found');
    });

    it('should return product', async () => {
      const mockCatalogFacade = {
        find: jest.fn().mockResolvedValue({
          id: '0',
          name: 'Product 0',
          description: 'Product 0 description',
          salesPrice: 10,
        }),
      }

      //@ts-expect-error - no params in constructor
      const placeOrderUseCase = new PlaceOrderUseCase();

      //@ts-expect-error - force set catalogFacade
      placeOrderUseCase["_catalogFacade"] = mockCatalogFacade;

      await expect(placeOrderUseCase["getProduct"]('0')).resolves.toEqual(
        new Product({
          id: new Id('0'),
          name: 'Product 0',
          description: 'Product 0 description',
          salesPrice: 10,
        })
      )

      expect(mockCatalogFacade.find).toBeCalledTimes(1);
    });
  });

  describe('placeOrderTest', () => {
    const clientProps = {
      id: '1c',
      name: 'Client 1',
      document: '123456789',
      email: 'client@email.com',
      address: {
        street: 'Street 1',
        number: '1',
        complement: 'Complement 1',
        city: 'City 1',
        state: 'State 1',
        zipCode: '12345678',
      }
    };

    const mockClientFacade = {
      find: jest.fn().mockResolvedValue(clientProps),
      add: jest.fn(),
    }

    const mockPaymentFacade = { process: jest.fn() }

    const mockCheckoutRepository = { addOrder: jest.fn(), findOrder: jest.fn() }

    const mockInvoiceFacade = {
      generate: jest.fn().mockResolvedValue({ id: '1i' }),
      find: jest.fn(),
    }

    const placeOrderUseCase = new PlaceOrderUseCase(
      mockClientFacade,
      null,
      null,
      mockCheckoutRepository,
      mockInvoiceFacade,
      mockPaymentFacade,
    );

    const products = {
      '1': new Product({
        id: new Id('1'),
        name: 'Product 1',
        description: 'Product 1 description',
        salesPrice: 40,
      }),
      '2': new Product({
        id: new Id('2'),
        name: 'Product 2',
        description: 'Product 2 description',
        salesPrice: 30,
      }),
    }

    const mockValidateProducts = jest
      //@ts-expect-error - spy on private method
      .spyOn(placeOrderUseCase, "validateProducts")
      //@ts-expect-error - spy on private method
      .mockResolvedValue(null);

    const mockGetProduct = jest
      //@ts-expect-error - spy on private method
      .spyOn(placeOrderUseCase, "getProduct")
      //@ts-expect-error - spy on private method
      .mockImplementation((productId: keyof typeof products) => products[productId]);

    it('should thrown an error when order is not approved', async () => {
      mockPaymentFacade.process = mockPaymentFacade.process.mockReturnValue({
        transactionId: '1t',
        orderId: '1o',
        amount: 100,
        status: 'error',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input: PlaceOrderInputDto = {
        clientId: '1c',
        products: [{ productId: '1' }, { productId: '2' }],
      };

      let output = await placeOrderUseCase.execute(input);

      expect(output.invoiceId).toBeNull();
      expect(output.total).toBe(70);
      expect(output.products).toStrictEqual([
        { productId: '1' },
        { productId: '2' },
      ]);

      expect(mockClientFacade.find).toBeCalledTimes(1);
      expect(mockClientFacade.find).toHaveBeenCalledWith({ id: '1c' });
      expect(mockValidateProducts).toBeCalledTimes(1);
      expect(mockValidateProducts).toHaveBeenCalledWith(input);
      expect(mockGetProduct).toBeCalledTimes(2);
      expect(mockCheckoutRepository.addOrder).toBeCalledTimes(1);
      expect(mockPaymentFacade.process).toBeCalledTimes(1);
      expect(mockPaymentFacade.process).toHaveBeenCalledWith({
        orderId: output.orderId,
        amount: output.total,
      });
      expect(mockInvoiceFacade.generate).toBeCalledTimes(0);
    });

    it('should create an order when it is approved', async () => {
      mockPaymentFacade.process = mockPaymentFacade.process.mockReturnValue({
        transactionId: '1t',
        orderId: '1o',
        amount: 100,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input: PlaceOrderInputDto = {
        clientId: '1c',
        products: [{ productId: '1' }, { productId: '2' }],
      };

      let output = await placeOrderUseCase.execute(input);

      expect(output.invoiceId).toBe('1i');
      expect(output.total).toBe(70);
      expect(output.products).toStrictEqual([
        { productId: '1' },
        { productId: '2' },
      ]);
      expect(mockClientFacade.find).toBeCalledTimes(1);
      expect(mockClientFacade.find).toHaveBeenCalledWith({ id: '1c' });
      expect(mockValidateProducts).toBeCalledTimes(1);
      expect(mockValidateProducts).toHaveBeenCalledWith(input);
      expect(mockGetProduct).toBeCalledTimes(2);
      expect(mockCheckoutRepository.addOrder).toBeCalledTimes(1);
      expect(mockPaymentFacade.process).toBeCalledTimes(1);
      expect(mockPaymentFacade.process).toHaveBeenCalledWith({
        orderId: output.orderId,
        amount: output.total,
      });
      expect(mockInvoiceFacade.generate).toBeCalledTimes(1);
      expect(mockInvoiceFacade.generate).toHaveBeenCalledWith({
        name: clientProps.name,
        document: clientProps.document,
        street: clientProps.address.street,
        number: clientProps.address.number,
        complement: clientProps.address.complement,
        city: clientProps.address.city,
        state: clientProps.address.state,
        zipCode: clientProps.address.zipCode,
        items: [
          {
            id: products['1'].id.id,
            name: products['1'].name,
            price: products['1'].salesPrice,
          },
          {
            id: products['2'].id.id,
            name: products['2'].name,
            price: products['2'].salesPrice,
          }
        ],
      });
    });
  });

  describe('executeMethodTest', () => {
    it('should throw an error when client not found', async () => {
      const mockClientFacade = {
        find: jest.fn().mockResolvedValue(null),
      }

      //@ts-expect-error - no params in constructor
      const placeOrderUseCase = new PlaceOrderUseCase();
      //@ts-expect-error - force set clientFacade
      placeOrderUseCase["_clientFacade"] = mockClientFacade;

      const input: PlaceOrderInputDto = {
        clientId: '0',
        products: [],
      }

      await expect(placeOrderUseCase.execute(input))
        .rejects
        .toThrowError('Client not found');
    });

    it('should throw an error when product is not valid', async () => {
      const mockClientFacade = {
        find: jest.fn().mockResolvedValue({}),
      }

      //@ts-expect-error - no params in constructor
      const placeOrderUseCase = new PlaceOrderUseCase();

      const mockValidateProducts = jest
        //@ts-expect-error - spy on private method
        .spyOn(placeOrderUseCase, 'validateProducts')
        //@ts-expect-error - no return never
        .mockRejectedValue(new Error('No products selected'));

      //@ts-expect-error - force set clientFacade
      placeOrderUseCase["_clientFacade"] = mockClientFacade;

      const input: PlaceOrderInputDto = {
        clientId: '1',
        products: [],
      }

      await expect(placeOrderUseCase.execute(input))
        .rejects
        .toThrowError('No products selected');

      expect(mockValidateProducts).toBeCalledTimes(1);
    });
  });
});