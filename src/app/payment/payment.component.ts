import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PaymentService } from '../payment.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  public paymentForm: FormGroup;
  public availableBalance: number = 700000;
  @Output() public categories: EventEmitter<any> = new EventEmitter();

  public paymentTypes = [
    { id: 1, name: 'Make Payment' },
    { id: 2, name: 'Receive Payment' }
  ];

  public allCategories = [
    { id: 1, name: 'Medical' },
    { id: 2, name: 'Travel' },
    { id: 3, name: 'Loans' },
    { id: 4, name: 'Utility Bills' },
    { id: 5, name: 'Education' },
    { id: 6, name: 'Shooping' },
    { id: 7, name: 'Misc' }
  ];

  constructor(private paymentService: PaymentService) { }

  ngOnInit(): void {
    this.categories.emit(this.allCategories);
    this.paymentForm = new FormGroup({
      amount: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
      payment: new FormControl('', [Validators.required]),
      category: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required])
    })
  }

  onPayment() {
    if (this.availableBalance - this.paymentForm.value.amount > 0 && this.paymentForm.value.payment.name == 'Make Payment') {
      this.availableBalance -= this.paymentForm.value.amount;
      this.paymentService.publishPayment(this.paymentForm.value);
    } else if (this.paymentForm.value.payment.name == 'Receive Payment') {
      this.availableBalance += this.paymentForm.value.amount;
      this.paymentService.publishPayment(this.paymentForm.value);
    } else {
      alert('Insufficient balance...')
    }
    this.paymentForm.reset();
  }
}
