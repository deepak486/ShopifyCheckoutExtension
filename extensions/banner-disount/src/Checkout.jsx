import {
  reactExtension,
  Banner,
  BlockStack,
  InlineStack,
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
  const { banner_title, banner_image_url, button_text, checkbox_text } = useSettings(); 
  const translate = useTranslate();
  const { extension } = useApi();
  const instructions = useInstructions();
  const applyCartLinesChange = useApplyCartLinesChange();
  const cartLines = useCartLines();

  const free_product_variant_id = useSettings();
  console.log(free_product_variant_id.free_product_variant_id);

  // ✅ Variant ID of free gift
  const FREE_PRODUCT_VARIANT_ID = "gid://shopify/ProductVariant/"+free_product_variant_id.free_product_variant_id;

  const canAddCartLine = instructions?.lines?.canAddCartLine ?? false;
  const canRemoveCartLine = instructions?.lines?.canRemoveCartLine ?? false;
  const canUpdateCartLine = instructions?.lines?.canUpdateCartLine ?? false;
  const canUpdateCartLines = canAddCartLine && canRemoveCartLine && canUpdateCartLine;

  const showWarning = !canUpdateCartLines;

  console.log("openURL support:", typeof extension.openURL === 'function');
  console.log("openURL available: ",  extension); 

  function handleImageClick() {
    console.log('Image clicked!');
    if(typeof extension.openURL === "function"){
    extension.openURL("https://www.google.com");
  } else {
    console.warn("openURL method is not available in this extension environment");
  }
    console.log('URL opened!'); 
  } 
 
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

  // Example upsell products data - replace with real data or settings/metafields
  const upsellProducts = [
    {
      id: "gid://shopify/ProductVariant/45508005658877",
      title: "Upsell Product 1",
      image:
        "https://cdn.shopify.com/s/files/1/0000/0001/products/product1.jpg?v=100",
      price: "$19.99",
    },
    {
      id: "gid://shopify/ProductVariant/45508005658877",
      title: "Upsell Product 2",
      image:
        "https://cdn.shopify.com/s/files/1/0000/0001/products/product2.jpg?v=100",
      price: "$29.99",
    },
    {
      id: "gid://shopify/ProductVariant/45508005658877",
      title: "Test Product 3",
      image:
        "https://cdn.shopify.com/s/files/1/0000/0001/products/product3.jpg?v=100",
      price: "$39.99",
    },
  ];

  // Add upsell product to cart handler
  const addUpsellProduct = async (variantId) => {
    if (!canAddCartLine) {
      console.error("Cart line updates not allowed");
      return;
    }
    try {
      await applyCartLinesChange({
        type: "addCartLine",
        merchandiseId: variantId,
        quantity: 1,
      });
    } catch (error) {
      console.error("Error adding upsell product:", error);
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
{/* 
{banner_image_url && (
  <Link url="https://www.google.com" external accessibilityLabel="Special Offer Link">
    <Image
      source={banner_image_url}
      alt="Special Offer"
      width={400}
      height={100}
      style={{ cursor: "pointer", borderRadius: 8 }}
    />
  </Link>
)} */}

      
        {banner_image_url && (
         
          <Image
            source={banner_image_url}
            alt="Special Offer"
            width={400}
            height={100}
            style={{ cursor: "pointer", borderRadius: 8 }}
            onClick={handleImageClick}
          />
  )}
     

      <Button
        onPress={addProduct}
        buttonType="primary"
        accessibilityLabel="Click to claim offer"
        disabled={showWarning}
        style={{ marginTop: 8 }}
      >
         {button_text || "Claim Free Gift"}  
      </Button>

      {/*  ✅ Checkbox now syncs with cart state  */}
      <Checkbox
        disabled={showWarning}
        checked={isChecked}
        onChange={onCheckboxChange}
      >
        {checkbox_text || "Add free gift to your order!"} 
      </Checkbox> 
      {/* Upsell product list */}
      <InlineStack spacing="base" wrap="no-wrap"> 
        {upsellProducts.map((product) => (
          <BlockStack
            key={product.id}
            border="base"
            padding="base"
            style={{ marginBottom: 10 }}
          >
            <Image
              source={product.image}
              alt={product.title}
              width={100}
              height={100}
              style={{ borderRadius: 8 }}
            />
            <Text>{product.title}</Text>
            <Text>{product.price}</Text>
            <Button
              onPress={() => addUpsellProduct(product.id)}
              disabled={showWarning}
              accessibilityLabel={`Add ${product.title} to cart`}
              style={{ marginTop: 5 }}
            >
              Add to Cart
            </Button>
          </BlockStack>
        ))}
      </InlineStack> 
    </BlockStack>

    
  );
}
