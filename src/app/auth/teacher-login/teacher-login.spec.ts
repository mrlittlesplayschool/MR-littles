import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherLoginComponent } from './teacher-login';

describe('TeacherLogin', () => {
  let component: TeacherLoginComponent;
  let fixture: ComponentFixture<TeacherLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherLoginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherLoginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
