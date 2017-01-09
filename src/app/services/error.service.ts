import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
declare var $: any;

@Injectable()
export class ErrorService {
  constructor() { }

  getError(error: any): string {
    if (error instanceof Response) {
      if (error.text() !== '') {
        const body = error.json() || '';
        if(body.error) {
          return body.error;
        } else {
          let errors = [];
          for(let key in body) {
            let name_parts = key.split('_');
            for(let i=0;i<name_parts.length;i++) {
              name_parts[i] = name_parts[i].charAt(0).toUpperCase() + name_parts[i].substring(1);
            }
            let name = name_parts.join(' ');
            body[key].forEach((value: string) => {
              errors.push(name + ' ' + value);
            });
            let values = body[key];
          }
          return '<ul><li>' + errors.join('</li><li>') +  '</li></ul>';
        }
      } else {
        return error.statusText;
      }
    } else {
      return error.message ? error.message : error.toString();
    }
  }

  showError(error: string): void {
    $('#errorDialog').one('show.bs.modal', function (event) {
      $(this).find('.modal-body').html(error);
    }).modal();
  }
}
