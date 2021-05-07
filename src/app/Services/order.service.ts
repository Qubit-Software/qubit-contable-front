import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConsumidorModel } from '../Models/Consumidor';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  inventarioItems$: Observable<{ 'items': object[], 'selectItem': object }>;
  consumidor$: Observable<ConsumidorModel>;
  private inventarioItemsSubject: Subject<{ 'items': object[], 'selectItem': object }>;
  private consumidor: Subject<ConsumidorModel>;
  constructor() {
    this.inventarioItemsSubject = new Subject<{ 'items': object[], 'selectItem': object }>();
    this.consumidor = new Subject<ConsumidorModel>();
    this.inventarioItems$ = this.inventarioItemsSubject.asObservable();
    this.consumidor$ = this.consumidor.asObservable();
  }

  chargeItemsInventario(value) {
    this.inventarioItemsSubject.next(value);
  }
  UpdateConsumidor(value: ConsumidorModel) {
    this.consumidor.next(value);
  }
}
