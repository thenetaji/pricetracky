const fs = require('fs').promises;
const cheerio = require('cheerio');

async function parseLocalHTML(filePath = 'i.html') {
  try {
    const html = await fs.readFile(filePath, 'utf-8');
    const $ = cheerio.load(html);
    const scriptContent = $('#__NEXT_DATA__').html();

    if (!scriptContent) {
      throw new Error('__NEXT_DATA__ script tag not found in ' + filePath);
    }

    const jsonData = JSON.parse(scriptContent);
    const product = jsonData.props?.pageProps?.initialData?.data?.product;

    if (!product) {
      throw new Error('Product data structure not found in __NEXT_DATA__ of ' + filePath);
    }

    const productDetails = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.priceInfo?.currentPrice?.price,
      currency: product.priceInfo?.currentPrice?.currencyUnit,
      description: product.shortDescription,
      images: product.imageInfo?.allImages?.map(img => img.url) || [],
      rating: product.averageRating,
      reviewsCount: product.reviewsCount,
      specifications: product.specificationAttributes?.map(spec => ({
        name: spec.name,
        values: spec.values,
      })) || [],
      availability: product.availabilityStatus,
      seller: product.sellerName,
      upc: product.upc,
      productUrl: product.productUrl,
      productType: product.productType,
      modelNumber: product.modelNumber,
      manufacturer: product.manufacturer,
      categoryPath: product.categoryPath,
      categoryPathName: product.categoryPathName,

    };

    console.log(productDetails);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

parseLocalHTML();
 