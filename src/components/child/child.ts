import { Component } from '@angular/core';

/*
  Generated class for the Child component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'child',
  templateUrl: 'child.html'
})
export class ChildComponent {

  text: string;

  constructor() {
    console.log('Hello Child Component');
    this.text = 'Hello World';
  }

}
