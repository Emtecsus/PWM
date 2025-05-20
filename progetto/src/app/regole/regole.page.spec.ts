import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegolePage } from './regole.page';

describe('RegolePage', () => {
  let component: RegolePage;
  let fixture: ComponentFixture<RegolePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegolePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
