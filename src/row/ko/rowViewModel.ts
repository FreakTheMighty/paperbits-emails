/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import * as ko from "knockout";
import template from "./row.html";
import { Component } from "@paperbits/core/ko/component";
import { WidgetViewModel } from "@paperbits/core/ko/widgetViewModel";

@Component({
    selector: "email-row",
    template: template
})
export class RowViewModel implements WidgetViewModel {
    public widgets: KnockoutObservableArray<WidgetViewModel>;
    public css: KnockoutComputed<string>;
    public alignSm: KnockoutObservable<string>;
    public alignMd: KnockoutObservable<string>;
    public alignLg: KnockoutObservable<string>;
    public justifySm: KnockoutObservable<string>;
    public justifyMd: KnockoutObservable<string>;
    public justifyLg: KnockoutObservable<string>;

    constructor() {
        this.widgets = ko.observableArray<WidgetViewModel>();
        this.alignSm = ko.observable<string>();
        this.alignMd = ko.observable<string>();
        this.alignLg = ko.observable<string>();
        this.justifySm = ko.observable<string>();
        this.justifyMd = ko.observable<string>();
        this.justifyLg = ko.observable<string>();

        this.css = ko.computed(() => {
            let css = "";

            if (this.alignSm()) {
                css += " " + this.alignSm() + "-sm";
            }
            if (this.alignMd()) {
                css += " " + this.alignMd() + "-md";
            }
            if (this.alignLg()) {
                css += " " + this.alignLg() + "-lg";
            }
            if (this.justifySm()) {
                css += " " + this.justifySm() + "-sm";
            }
            if (this.justifyMd()) {
                css += " " + this.justifyMd() + "-md";
            }
            if (this.justifyLg()) {
                css += " " + this.justifyLg() + "-lg";
            }

            return css;
        });
    }
}
