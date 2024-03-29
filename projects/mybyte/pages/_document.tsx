import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  gray_bg_routes = [
    "/login",
    "/signup",
    "/resetPasswordSuccess",
    "/emailVerification",
  ];

  getColor() {
    const { page } = this.props?.__NEXT_DATA__;

    if (this.gray_bg_routes.includes(page)) {
      return "bg-[#e3e3e3]";
    }

    return "";
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/UGAHacks_General_Byte.png" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
