# cyd
台湾教育部成語典轉 PTK 格式

台湾教育部国语辞典 以下称gycd CC BY-ND 3.0
[数据源](https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html)

## steps
    download latest zip
    convert to xml and save in raw
    https://www.freeconvert.com/xlsx-to-xml

    node xml2tsv  // dump all data into tsv format , crlf as \n

    node gen