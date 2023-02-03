import AggregateRoot from "../../@shared/domain/entity/aggregate-root.interface";
import BaseEntity from "../../@shared/domain/entity/base.entity";
import Id from "../../@shared/domain/value-object/id.value-object";
import Address from "./address.valueobject";
import Product from "./product.entity";

export type InvoiceProps = {
  id?: Id;
  name: string;
  document: string;
  address: Address;
  items: Product[];
  createdAt?: Date;
  updatedAt?: Date;
}

export default class Invoice extends BaseEntity implements AggregateRoot {
  private _name: string;
  private _document: string;
  private _address: Address;
  private _items: Product[];

  constructor(props: InvoiceProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._name = props.name;
    this._document = props.document;
    this._address = props.address;
    this._items = props.items;
  }

  get name(): string {
    return this._name;
  }

  get document(): string {
    return this._document;
  }

  get address(): Address {
    return this._address;
  }

  get items(): Product[] {
    return this._items;
  }

  set name(name: string) {
    this._name = name;
  }

  set document(document: string) {
    this._document = document;
  }

  addressToString(): string {
    return `${this._address.street}, ${this._address.number} - ${this._address.complement} - ${this._address.city} - ${this._address.state} - ${this._address.zipCode}`;
  }

  changeAddress(address: Address) {
    this._address = address;
  }

  addItem(item: Product) {
    this._items.push(item);
  }

  removeItem(item: Product) {
    this._items = this._items.filter((i) => i.id !== item.id);
  }
}