import { Component, Input, OnInit } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  @Input() data: Object = {};

  constructor() { }

  ngOnInit(): void {
    if (this.data == null) {
      this.data = {}
    }
  }
  //descarga un pdf
  downloadPDF() {
    const DATA = document.getElementById('htmlData');
    console.log(DATA);
    let doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 5,
      scrollX: 0,
      scrollY: 0
    };
    html2canvas(DATA, options).then((canvas) => {
      console.log(canvas)
      const img = canvas.toDataURL('image/PNG');
      // Add image Canvas to PDF
      const bufferX = 15;
      const bufferY = 60;
      const imgProps = (doc as any).getImageProperties(img);
      const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addImage(img, 'JPEG', 15, 15, pdfWidth, (pdfHeight - 60), "a", "FAST");
      return doc
    }).then((docResult) => {
      docResult.save(`${new Date().toISOString()}_Lad21.pdf`);
    });
  }
}
