import test from 'ava';
import { parseRAMLSync } from 'raml-1-parser';
import { getRestApiArr, getAnnotationByName } from '@/read-raml';
import { Api } from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';

test('Given read raml /products When getRestApiArr() Then get webAPI array', (t) => {
  const webAPIArr = [
    {
      url: '/products',
      method: 'get',
      description: '商品列表',
      queryParameters: [],
      uriParameters: {},
      responses: [
        {
          code: 200,
          body: {
            mimeType: 'application/json',
            text: `{
  "a": 1
}
`,
          },
        },
      ],
    },
  ];
  const ramlStr = `
#%RAML 1.0
---
baseUri: /
mediaType: application/json
/products:
  get:
    description: 商品列表
    responses:
      200:
        body:
          example: |
            {
              "a": 1
            }
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;

  const result = getRestApiArr(apiJSON);
  t.deepEqual(result, webAPIArr);
});

test('Given url has queryParameter When read raml Then get webAPI array', (t) => {
  const webAPIArr = [
    {
      url: '/products',
      uriParameters: {},
      method: 'get',
      description: '商品列表',
      queryParameters: [{
        name: 'isStar',
        example: 'true',
        required: false,
        type: 'boolean',
      }],
      responses: [
        {
          code: 200,
          body: {
            mimeType: 'application/json',
            text: `{
  "a": 1
}
`,
          },
        },
      ],
    },
  ];
  const ramlStr = `
#%RAML 1.0
---
baseUri: /
mediaType: application/json
/products:
  get:
    description: 商品列表
    queryParameters:
      isStar:
        description: 是否精选
        type: boolean
        required: false
        example: true
    responses:
      200:
        body:
          example: |
            {
              "a": 1
            }
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;

  const result = getRestApiArr(apiJSON);
  t.deepEqual(result, webAPIArr);
});

test('Given read raml When post /products has data Then get webAPI array', (t) => {
  const webAPIArr = [
    {
      url: '/products',
      method: 'post',
      description: '商品列表',
      queryParameters: [],
      uriParameters: {},
      body: {
        mimeType: 'application/json',
        text: `{
  "isStar": true
}`,
      },
      responses: [
        {
          code: 200,
          body: {
            mimeType: 'application/json',
            text: `{
  "a": 1
}
`,
          },
        },
      ],
    },
  ];
  const ramlStr = `
#%RAML 1.0
---
baseUri: /
mediaType: application/json
/products:
  post:
    description: 商品列表
    body:
      example:
        {
          isStar: true
        }
    responses:
      200:
        body:
          example: |
            {
              "a": 1
            }
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;

  const result = getRestApiArr(apiJSON);
  t.deepEqual(result, webAPIArr);
});

test(`Given read raml and response type is xml
  When post /products has data Then get webAPI array`, (t) => {
  const webAPIArr = [
    {
      url: '/products',
      method: 'post',
      description: '商品列表',
      queryParameters: [],
      uriParameters: {},
      body: {
        mimeType: 'application/json',
        text: `{
  "isStar": true
}`,
      },
      responses: [
        {
          code: 200,
          body: {
            mimeType: 'application/xml',
            text: `<xml>abc</xml>
`,
          },
        },
      ],
    },
  ];
  const ramlStr = `
#%RAML 1.0
---
baseUri: /
mediaType: application/json
/products:
  post:
    description: 商品列表
    body:
      example:
        {
          isStar: true
        }
    responses:
      200:
        body:
          application/xml:
            example: |
              <xml>abc</xml>
`;
  const apiJSON = parseRAMLSync(ramlStr) as Api;

  const result = getRestApiArr(apiJSON);
  t.deepEqual(result, webAPIArr);
});

test('Given read raml When /products has uriParameters Then get webAPI array', (t) => {
  const expectedResult = [
    {
      url: '/products/{productId}',
      method: 'get',
      uriParameters: {
        id: 'aaaa',
      },
      queryParameters: [],
      responses: [
        {
          code: 200,
          body: {
            mimeType: 'application/json',
            text: `{
  "a": 1
}
`,
          },
        },
      ],
    },
  ];
  const ramlStr = `
#%RAML 1.0
---
baseUri: /
mediaType: application/json
/products/{productId}:
  get:
    (uriParameters):
      id:
        description: article id
        example: aaaa
    responses:
      200:
        body:
          example: |
            {
              "a": 1
            }
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;

  const result = getRestApiArr(apiJSON);
  t.deepEqual(result, expectedResult);
});

test('Given read raml  When(runner) annotations Then get annotation object', (t) => {
  const expectResult = {
    id: {
      description: 'article id',
      example: 'aaaa',
    },
  };
  const ramlStr = `
#%RAML 1.0
---
baseUri: /
mediaType: application/json
/products/{productId}:
  get:
    (runner):
      id:
        description: article id
        example: aaaa
    responses:
      200:
        body:
          example: |
            {
              "a": 1
            }
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;

  const [resource] = apiJSON.allResources();
  const [method] = resource.methods();
  const result = getAnnotationByName('runner', method);
  t.deepEqual(result, expectResult);
});

test('Given raml has two uri When getRestApiArr() Then RestApi[] length is 2', (t) => {
  const expectResult = {
    id: {
      description: 'article id',
      example: 'aaaa',
    },
  };
  const ramlStr = `
#%RAML 1.0
---
baseUri: /
mediaType: application/json

/products:
  get:
    responses:
      200:
        body:
          example: |
            {
              "a": 1
            }
/products/{productId}:
  get:
    responses:
      200:
        body:
          example: |
            {
              "b": 1
            }
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;

  const result = getRestApiArr(apiJSON);
  t.is(result.length, 2);
});

test('Given raml has two uri and multiple methods When getRestApiArr() Then RestApi[] length is 3', (t) => {
  const expectResult = {
    id: {
      description: 'article id',
      example: 'aaaa',
    },
  };
  const ramlStr = `
#%RAML 1.0
---
baseUri: /
mediaType: application/json

/products:
  get:
    responses:
      200:
        body:
          example: |
            {
              "a": 1
            }
/products/{productId}:
  get:
    responses:
      200:
        body:
          example: |
            {
              "b": 1
            }
  post:
    responses:
      200:
        body:
          example: |
            {
              "b": 1
            }
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;

  const result = getRestApiArr(apiJSON);
  t.is(result.length, 3);
});


test('Given raml has 2 response code And example When getRestApiArr() Then RestApi has 2 responses', (t) => {
  const expectResult = {
    url: '/products',
    uriParameters: {},
    method: 'get',
    queryParameters: [],
    responses: [
      {
        code: 200,
        body: {
          mimeType: 'application/json',
          text: `{
  "a": 1
}
`,
        },
      },
      {
        code: 400,
        body: {
          mimeType: 'application/json',
          text: `{
  "b": 1
}
`,
        },
      },
    ],
  };
  const ramlStr = `
#%RAML 1.0
---
baseUri: /
mediaType: application/json

/products:
  get:
    responses:
      200:
        body:
          example: |
            {
              "a": 1
            }
      400:
        body:
          example: |
            {
              "b": 1
            }
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;

  const restApi = getRestApiArr(apiJSON).pop();
  t.deepEqual(restApi, expectResult);
  t.is(restApi.responses.length, 2);
});


test('Given raml has base origin When getRestApiArr() Then RestApi just has pathname', (t) => {
  const expectResult = {
    url: '/products',
    uriParameters: {},
    method: 'get',
    queryParameters: [],
    responses: [
      {
        code: 200,
        body: {
          mimeType: 'application/json',
          text: `{
  "a": 1
}
`,
        },
      },
    ],
  };
  const ramlStr = `
#%RAML 1.0
---
baseUri: http://www.a.com
mediaType: application/json

/products:
  get:
    responses:
      200:
        body:
          example: |
            {
              "a": 1
            }
  `;
  const apiJSON = parseRAMLSync(ramlStr) as Api;

  const restApi = getRestApiArr(apiJSON).pop();
  t.deepEqual(restApi, expectResult);
});
