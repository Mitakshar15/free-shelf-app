import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OauthSelectRoleComponent } from './oauth-select-role.component';

describe('OauthSelectRoleComponent', () => {
  let component: OauthSelectRoleComponent;
  let fixture: ComponentFixture<OauthSelectRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OauthSelectRoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OauthSelectRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
