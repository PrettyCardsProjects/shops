
import { Shop } from "../shop_layout";
import { StandardTalkScreen } from "../screens/standard_talk_screen";
import { us_loaded, addSetting, plugin } from "../underscript_checker";
import { ArtifactsScreen } from "../screens/artifacts_screen";
import { GersonAnimation } from "../shopkeeper_anims/gerson_anim";
import { CosmeticsShopScreen } from "../screens/cosmetics_shop_screen";

var cosm_setting = addSetting({
    'key': 'cosmetics_shop_toggle',
    'name': 'Enable Cosmetics Shop Override', // Name in settings page
    'type': 'boolean',
    'refresh': true, // true to add note "Will require you to refresh the page"
    'default': true, // default value
    'category': "Page Specific",
});

if (us_loaded && cosm_setting.value() && underscript.onPage('CosmeticsShop')) {
    underscript.utils.compoundEvent("PrettyCardsShops:CSSReady", "PrettyCards:TranslationExtReady", function () {
        window.prettycards.cosmeticShop.GetData().then((cosmeticsData) => {
            var shop = new Shop("swatch");
            shop.RemoveEverythingElse();
            document.getElementsByClassName("mainContent")[0].appendChild(shop.container); // The order here is important, as the entire thing MUST be a part of the document before playing the song, as it may need the button, which needs tippy, and tippy doesn't like elements that are not part of the document.
            shop.SetupBackgroundAndMusic();
            shop.SetShopkeeperAnim(GersonAnimation);
            shop.AddMenuOption("buy");
            shop.AddMenuOption("check");
            shop.AddMenuOption("talk");
            shop.AddDefaultExitPage();

            var shopScreen = new CosmeticsShopScreen(cosmeticsData, shop.GetPageElement(0));
            shopScreen.Render();

            var checkScreen = new CosmeticsShopScreen(cosmeticsData, shop.GetPageElement(1), true);
            checkScreen.Render();

            artifacts.forEach((artifact) => {
                window.tippy(`[artid="${artifact.id}"]`, {
                    content: `<span class="${artifact.rarity}">${window.$.i18n("artifact-name-" + artifact.id)}</span>`,
                    allowHTML: true,
                    arrow: true,
                    inertia: true,
                    placement: "top",
                    appendTo: window.document.body,
                    boundary: 'window',
                    getReferenceClientRect: window.document.body.getBoundingClientRect
                });
            })
            

            var talkScreen = new StandardTalkScreen(shop);
            talkScreen.AddTalkFast("aboutyou", false, "unlocktest");
            talkScreen.AddTalkFast("emblem");
            talkScreen.AddTalkFast("unlocktest", true);

            var talkBase = shop.GetPageElement(2);
            talkBase.appendChild(talkScreen.container);
            talkScreen.Render();
            /*
            setTimeout(function() {
                shop.SetDialogue("[instant]Hi![w:500] I'm [style:red]Gerson[style:]![speed:500] [instant:off][style:cyan]\rNice to meet you![speed:33] \nNow I will have an insanely long monologue for testing purposes!");
            }, 500);
            */

        });
        
    })
}