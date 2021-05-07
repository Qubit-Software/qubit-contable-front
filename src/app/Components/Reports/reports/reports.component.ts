import { Component, OnInit } from '@angular/core';

import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, Color } from 'ng2-charts';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  // *************** Pie Chart Config ************************
  public pieChartOptions: ChartOptions = { responsive: true, legend: { position: 'right', labels: { boxWidth: 12, padding: 25, fontFamily: 'Poppins-Medium' } } };
  public pieChartColors = [{ backgroundColor: ['#ADB7F0', '#343E7D', '#6F87EE'] }];
  public pieChartLabels: Label[] = [['SciFi'], ['Drama'], 'Comedy'];
  public pieChartData: SingleDataSet = [30, 50, 20];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  // *************** Pie Chart Config Ends ************************

  // *************** Bar Chart Config ************************

  public barChartOptions: ChartOptions = { responsive: true, scales: { xAxes: [{}], yAxes: [{}] }, legend: { position: 'left', labels: { boxWidth: 12, padding: 25, fontFamily: 'Poppins-Medium' } } };
  public barChartLabels: Label[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartColors: Color[] = [{ backgroundColor: '#ADB7F0' }, { backgroundColor: '#343E7D' },];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];
  // *************** Bar Chart Config Ends************************
  constructor() {
    //********** Chart Tool tip an legend */
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();

    //********** Chart Tool tip an legend  Ends*/
  }

  ngOnInit(): void {
  }

}
