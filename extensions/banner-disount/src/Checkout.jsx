import {
  reactExtension,
  Banner,
  BlockStack,
  Checkbox,
  Text,
  useApi,
  useCartLines,
  useInstructions,
  useTranslate,
  useApplyCartLinesChange,
  useSettings,
  Button,
  Image,
  Link,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const { banner_title, banner_image, banner_link } = useSettings();
  const translate = useTranslate();
  const { extension } = useApi();
  const instructions = useInstructions();
  const applyCartLinesChange = useApplyCartLinesChange();
  const cartLines = useCartLines();

  // ✅ Variant ID of free gift
  const FREE_PRODUCT_VARIANT_ID = "gid://shopify/ProductVariant/45508006052093";

  const canAddCartLine = instructions?.lines?.canAddCartLine ?? false;
  const canRemoveCartLine = instructions?.lines?.canRemoveCartLine ?? false;
  const canUpdateCartLine = instructions?.lines?.canUpdateCartLine ?? false;
  const canUpdateCartLines =
    canAddCartLine && canRemoveCartLine && canUpdateCartLine;

  const showWarning = !canUpdateCartLines;

  // ✅ Derive checkbox state from cart lines
  const freeGiftLine = cartLines.find(
    (line) => line.merchandise.id === FREE_PRODUCT_VARIANT_ID
  );
  const isChecked = Boolean(freeGiftLine);

  const addProduct = async () => {
    await applyCartLinesChange({
      type: "addCartLine",
      merchandiseId: FREE_PRODUCT_VARIANT_ID,
      quantity: 1,
    });
  };

  const removeProduct = async () => {
    if (freeGiftLine) {
      const qtyToRemove = Number(freeGiftLine.quantity) || 1;
      await applyCartLinesChange({
        type: "removeCartLine",
        id: freeGiftLine.id, // ✅ Cart line id
        quantity: qtyToRemove, // must be an integer ≥ 1
      });
    }
  };

  const onCheckboxChange = async (checked) => {
    if (!canUpdateCartLines) {
      console.error("Cart line updates not allowed");
      return;
    }

    try {
      if (checked) {
        await addProduct();
      } else {
        await removeProduct();
      }
    } catch (error) {
      console.error("Error updating cart lines:", error);
    }
  };

  return (
    <BlockStack border="dotted" padding="tight">
      <Text emphasis="">{banner_title}</Text> 
 
      {showWarning && (
        <Banner title="Discount Banner Free Product" status="warning">
          <Text>cartUpdatesNotAllowed</Text> 
        </Banner>
      )}

      <Link
        url="https://www.google.com"
        external={true}
        accessibilityLabel="Special Offer Link"
      >
        <BlockStack>
          <Image
            source="https://zimsonwatches.com/cdn/shop/articles/Breitling-Chronomat-Automatic-36-Two-Tone_c50028ca-33d0-4a72-9654-cbbac1d1f785.jpg?v=1758005739"
            alt="Special Offer"
            width={400}
            height={100}
            style={{ cursor: "pointer", borderRadius: 8 }}
          />
        </BlockStack>
      </Link>
{/* 
      <Button
        onPress={addProduct}
        buttonType="primary"
        accessibilityLabel="Click to claim offer"
        disabled={showWarning}
        style={{ marginTop: 8 }}
      >
        Claim Free Gift
      </Button> */}

      {/*  ✅ Checkbox now syncs with cart state  */}
      <Checkbox
        disabled={showWarning}
        checked={isChecked}
        onChange={onCheckboxChange}
      >
        {translate("iWouldLikeAFreeGiftWithMyOrder")}
      </Checkbox> 
    </BlockStack>
  );
}
