import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  payment: Subject<any> = new Subject();

  constructor() { }

  publishPayment(payment) {
    this.payment.next(payment);
  }

  getPayment() {
    return this.payment;
  }
}
