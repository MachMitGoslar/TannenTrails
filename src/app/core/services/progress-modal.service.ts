import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { ProgressModalComponent } from '../../views/components/progress-modal/progress-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ProgressModalService {
  private modalController = inject(ModalController);

  /**
   * Open the progress modal
   * @param totalStations Optional: specify the total number of stations (default: 10)
   * @returns Promise<void>
   */
  async openProgressModal(totalStations?: number): Promise<void> {
    const modal = await this.modalController.create({
      component: ProgressModalComponent,
      componentProps: {
        totalStations: totalStations || 10,
      },
      cssClass: 'progress-modal',
      backdropDismiss: true,
      showBackdrop: true,
    });

    await modal.present();
  }

  /**
   * Close any open progress modal
   */
  async closeProgressModal(): Promise<void> {
    const modal = await this.modalController.getTop();
    if (modal) {
      await modal.dismiss();
    }
  }
}
