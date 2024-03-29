import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AppState } from '../app-store/app.reducer';
import { NavigationBtnComponent } from '../navigation-btn/navigation-btn.component';
import { Addon, Addons } from '../step2/plan.service';
import { PlanState } from '../step2/store/step2.reducer';
import { loadAddons, selectAddon } from './store/step3.actions';
import { addonState } from './store/step3.reducer';

@Component({
  selector: 'app-step3',
  standalone: true,
  imports: [CommonModule, NavigationBtnComponent],
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.scss'],
})
export class Step3Component implements OnInit {
  constructor(private store: Store<AppState>, private router: Router) {}
  currentPlanType: 'monthly' | 'yearly';

  step2Sub$: Subscription;
  addonSub$: Subscription;
  selectedAddons: Addon[] = [];
  addons: Addons;
  addonList: Addon[] = [];

  ngOnDestroy(): void {
    if (this.step2Sub$) this.step2Sub$.unsubscribe();
    if (this.addonSub$) this.addonSub$.unsubscribe();
  }
  ngOnInit(): void {
    this.step2Sub$ = this.store.select('step2').subscribe((data: PlanState) => {
      // console.log('DATA IS', data);
      this.currentPlanType = data.planType;
      if (this.addons) this.addonList = this.addons[this.currentPlanType];
    });
    // this.addonSub$ = this.store.select('addon')
    this.store.dispatch(loadAddons());
    this.store.select('step3').subscribe((data: addonState) => {
      this.addons = data.addons;
      let addonList: Addon[] = this.addons[this.currentPlanType];
      const selectedAddons = data.selectedAddons;
      for (let index = 0; index < selectedAddons.length; index++) {
        addonList = addonList.map((addon) => {
          if (addon.name === selectedAddons[index].name) {
            return {
              ...addon,
              active: true,
            };
          } else {
            return addon;
          }
        });
      }
      this.addonList = [...addonList];
      this.selectedAddons = [...selectedAddons];

      // console.log(
      //   data,
      //   this.addonList,
      //   this.currentPlanType,
      //   this.selectedAddons
      // );
      if (!selectedAddons.length && this.addonList[0]) {
        this.selectAddon(this.addonList[0]);
      }
    });
  }
  selectAddon(addon: Addon): void {
    const selectedAddons = [...this.selectedAddons];
    const isExist = selectedAddons.findIndex(
      (selectedAddon) => selectedAddon.name === addon.name
    );
    console.log('is there ', isExist);

    if (isExist !== -1) {
      selectedAddons.splice(isExist, 1);
    } else {
      selectedAddons.push(addon);
    }
    console.log('selected addons ', selectedAddons);

    this.store.dispatch(selectAddon({ selectedAddons }));
  }
  goToStep4() {
    this.router.navigate(['/step-4']);
  }
  goToStep2() {
    this.router.navigate(['/step-2']);
  }
}
