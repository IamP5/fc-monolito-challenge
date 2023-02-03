import Product from "../../domain/product.entity";
import InvoiceGateway from "../../gateway/invoice.gateway";
import { FindInvoiceUseCaseInputDTO, FindInvoiceUseCaseOutputDTO } from "./find-invoice.dto";

export default class FindInvoiceUseCase {

  private readonly invoiceRepository: InvoiceGateway;

  constructor(invoiceRepository: InvoiceGateway) {
    this.invoiceRepository = invoiceRepository;
  }

  async execute(input: FindInvoiceUseCaseInputDTO): Promise<FindInvoiceUseCaseOutputDTO> {
    const invoice = await this.invoiceRepository.find(input.id);

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return {
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
    };
  }
}