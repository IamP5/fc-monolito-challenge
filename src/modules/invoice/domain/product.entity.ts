import BaseEntity from "../../@shared/domain/entity/base.entity";
import Id from "../../@shared/domain/value-object/id.value-object";

export type ProductProps = {
  id?: Id;
  name: string;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default class Product extends BaseEntity {
  private _name: string;
  private _price: number

  constructor(props: ProductProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._name = props.name;
    this._price = props.price;
  }

  get name(): string {
    return this._name;
  }

  get price(): number {
    return this._price;
  }

  set name(name: string) {
    this._name = name;
  }

  set price(price: number) {
    this._price = price;
  }
}