import { NgModule } from '@angular/core';

import {
  MatCardModule,
  MatInputModule,
  MatButtonModule,
  MatExpansionModule,
  MatIconModule,
  MatListModule,
  MatDatepickerModule,
  MatNativeDateModule
} from '@angular/material';

const modules = [
  MatCardModule,
  MatInputModule,
  MatButtonModule,
  MatExpansionModule,
  MatIconModule,
  MatListModule,
  MatNativeDateModule
];

@NgModule({
  imports: modules,
  exports: modules,
})
export class MaterialModule {}