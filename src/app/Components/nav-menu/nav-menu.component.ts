import { Component, OnInit } from '@angular/core';
import * as $ from "jquery";
@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
    $( ".sidebar-nav li" ).hover(
      function() {
        let imageEl=this.getElementsByTagName('img')[0];
        let altImage=imageEl.alt;
        let srcImage=imageEl.src;
        imageEl.src=altImage;
        imageEl.alt=srcImage;
      }, function() {
        let imageEl=this.getElementsByTagName('img')[0];
        let altImage=imageEl.alt;
        let srcImage=imageEl.src;
        imageEl.src=altImage;
        imageEl.alt=srcImage;
      }
    );
  }

  change(event: Event) {
    console.log('Hola');
    let imageEl = (<HTMLImageElement>(<HTMLElement>event.target).getElementsByTagName('img')[0]);
    let altAtributte = imageEl.alt;
    imageEl.src = altAtributte;
    console.log();
  }
}
