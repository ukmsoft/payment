import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3'
import * as moment from 'moment';
import { FormGroup, FormControl } from '@angular/forms';
import { PaymentService } from '../payment.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  @Input() categories: any;
  public transactions: any[] = [];
  public transactionsCopy: any[] = [];
  public transactionsChartData: any[] = [];
  public transactionsChartDataCopy: any[] = [];
  public newCategories = [{ id: -1, name: 'All' }];
  public frequencies = [
    { id: 1, name: 'All' },
    { id: 2, name: 'Current' }
  ];

  public selectedFrequency: any;
  public selectedMonth: any;
  public selectedCategory: any;
  public transactionForm: FormGroup;

  constructor(private paymentService: PaymentService) { }

  ngOnInit(): void {
    this.newCategories.push(...this.categories);
    this.selectedFrequency = this.frequencies.find(frequency => frequency.id === 1);
    this.selectedCategory = this.newCategories.find(category => category.id === -1);
    this.getPayment();

    this.transactionForm = new FormGroup({
      frequency: new FormControl(''),
      month: new FormControl(''),
      category: new FormControl('')
    })
  }

  getPayment() {
    this.paymentService.getPayment().subscribe(
      transaction => {
        this.transactions.push({ transactionId: `Tx${Math.floor(Math.random() * 1000)}`, ...transaction });
        this.transactionsCopy = [...this.transactions];
        const transactionsChartData = this.transactions.map(transaction => {
          if (transaction.category.name)
            return {
              category: transaction.category.name,
              percentage: this.transactions.filter(t => t.category.name === transaction.category.name).length,
              date: transaction.date
            }
        });
        this.transactionsChartData = this.getUniqueCategoryForChart(transactionsChartData, 'category');
        this.transactionsChartDataCopy = [...this.transactionsChartData];
        this.onCategoryChange(this.selectedCategory);
      }
    );
  }

  onFrequencyChange(frequency) {
    this.selectedFrequency = frequency;
    this.transactionsChartData = this.transactionsChartDataCopy;
    this.transactions = this.transactionsCopy;
    if (frequency.name === 'Current') {
      const currentTransactions = this.transactionsCopy.slice(this.transactions.length - 10);
      const transactionsChartData = currentTransactions.map(transaction => {
        if (transaction.category.name)
          return {
            category: transaction.category.name,
            percentage: currentTransactions.filter(t => t.category.name === transaction.category.name).length,
            date: transaction.date
          }
      });
      this.transactionsChartData = this.getUniqueCategoryForChart(transactionsChartData, 'category');
      this.transactions = currentTransactions;
    }
    this.pieChart();
  }

  onMonthChange(month) {
    this.selectedMonth = month;
    this.transactionsChartData = this.transactionsChartDataCopy;
    this.transactions = this.transactionsCopy;
    this.transactions = this.transactionsCopy.filter(transaction =>
      moment(transaction.date).format('YYYY-MM') === moment(this.selectedMonth).format('YYYY-MM'));

    const transactionsChartData = this.transactions.map(transaction => {
      if (transaction.category.name)
        return {
          category: transaction.category.name,
          percentage: this.transactions.filter(t => t.category.name === transaction.category.name).length,
          date: transaction.date
        }
    });
    this.transactionsChartData = this.getUniqueCategoryForChart(transactionsChartData, 'category');
    this.pieChart();
  }

  getUniqueCategoryForChart(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
  }

  onCategoryChange(selectedCategory) {
    if (selectedCategory.name !== 'All') {
      this.transactionsChartData = this.transactionsChartDataCopy.filter(transaction => transaction.category === selectedCategory.name);
      this.transactions = this.transactionsCopy.filter(transaction => transaction.category.name === selectedCategory.name);
    } else {
      this.transactionsChartData = this.transactionsChartDataCopy;
      this.transactions = this.transactionsCopy;
    }
    this.pieChart();
  }

  pieChart() {
    const data: any = this.transactionsChartData;

    const svgWidth = 200;
    const svgHeight = 200;
    const radius = Math.min(svgWidth, svgHeight) / 2;

    const svg = d3.select('.spend-analysis').attr('width', svgWidth).attr('height', svgHeight);
    const g = svg.append('g').attr('transform', 'translate(' + radius + ',' + radius + ')');
    const color = d3.scaleOrdinal(['#343a40', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c', '#941a1c', '#491a4c']);

    const pie = d3.pie().value(d => d['percentage']);
    const path: any = d3.arc().outerRadius(radius).innerRadius(0);
    const arc = g.selectAll().data(pie(data)).enter().append("g");
    arc.append('path').attr('d', path).attr('fill', d => color(d.data['percentage']));

    var label = d3.arc().outerRadius(radius + 10).innerRadius(0);
    arc.append('text')
      .attr('transform', d => 'translate(' + label.centroid(d.data['percentage']) + ')')
      .attr('text-anchor', 'middle')
      .text(d => d.data['category'] + ': ' + d.data['percentage']);
  }

}
