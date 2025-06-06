import type { Payload } from 'payload'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { lexicalDocData } from './collections/Lexical/data.js'
import { generateLexicalLocalizedRichText } from './collections/LexicalLocalized/generateLexicalRichText.js'
import { textToLexicalJSON } from './collections/LexicalLocalized/textToLexicalJSON.js'
import { lexicalMigrateDocData } from './collections/LexicalMigrate/data.js'
import { richTextBulletsDocData, richTextDocData } from './collections/RichText/data.js'
import {
  arrayFieldsSlug,
  collectionSlugs,
  lexicalFieldsSlug,
  lexicalLocalizedFieldsSlug,
  lexicalMigrateFieldsSlug,
  lexicalRelationshipFieldsSlug,
  richTextFieldsSlug,
  textFieldsSlug,
  uploadsSlug,
  usersSlug,
} from './slugs.js'

// import type { Payload } from 'payload'

import { getFileByPath } from 'payload'

import { devUser } from '../credentials.js'
import { seedDB } from '../helpers/seed.js'
import { arrayDoc } from './collections/Array/shared.js'
import { anotherTextDoc, textDoc } from './collections/Text/shared.js'
import { uploadsDoc } from './collections/Upload/shared.js'
// import { blocksDoc } from './collections/Blocks/shared.js'
// import { codeDoc } from './collections/Code/shared.js'
// import { collapsibleDoc } from './collections/Collapsible/shared.js'
// import { conditionalLogicDoc } from './collections/ConditionalLogic/shared.js'
// import { customRowID, customTabID, nonStandardID } from './collections/CustomID/shared.js'
// import { dateDoc } from './collections/Date/shared.js'
// import { anotherEmailDoc, emailDoc } from './collections/Email/shared.js'
// import { groupDoc } from './collections/Group/shared.js'
// import { jsonDoc } from './collections/JSON/shared.js'
// import { lexicalDocData } from './collections/Lexical/data.js'
// import { generateLexicalLocalizedRichText } from './collections/LexicalLocalized/generateLexicalRichText.js'
// import { textToLexicalJSON } from './collections/LexicalLocalized/textToLexicalJSON.js'
// import { lexicalMigrateDocData } from './collections/LexicalMigrate/data.js'
// import { numberDoc } from './collections/Number/shared.js'
// import { pointDoc } from './collections/Point/shared.js'
// import { radiosDoc } from './collections/Radio/shared.js'
// import { richTextBulletsDocData, richTextDocData } from './collections/RichText/data.js'
// import { selectsDoc } from './collections/Select/shared.js'
// import { tabsDoc } from './collections/Tabs/shared.js'
// import { anotherTextDoc, textDoc } from './collections/Text/shared.js'
// import { uploadsDoc } from './collections/Upload/shared.js'
// import {
//   arrayFieldsSlug,
//   blockFieldsSlug,
//   checkboxFieldsSlug,
//   codeFieldsSlug,
//   collapsibleFieldsSlug,
//   collectionSlugs,
//   conditionalLogicSlug,
//   customIDSlug,
//   customRowIDSlug,
//   customTabIDSlug,
//   dateFieldsSlug,
//   emailFieldsSlug,
//   groupFieldsSlug,
//   jsonFieldsSlug,
//   lexicalFieldsSlug,
//   lexicalLocalizedFieldsSlug,
//   lexicalMigrateFieldsSlug,
//   lexicalRelationshipFieldsSlug,
//   numberFieldsSlug,
//   pointFieldsSlug,
//   radioFieldsSlug,
//   relationshipFieldsSlug,
//   richTextFieldsSlug,
//   selectFieldsSlug,
//   tabsFieldsSlug,
//   textFieldsSlug,
//   uiSlug,
//   uploads2Slug,
//   uploadsMulti,
//   uploadsMultiPoly,
//   uploadsPoly,
//   uploadsSlug,
//   usersSlug,
// } from './slugs.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const seed = async (_payload: Payload) => {
  const jpgPath = path.resolve(dirname, './collections/Upload/payload.jpg')
  const pngPath = path.resolve(dirname, './uploads/payload.png')

  // Get both files in parallel
  const [jpgFile, pngFile] = await Promise.all([getFileByPath(jpgPath), getFileByPath(pngPath)])

  const createdArrayDoc = await _payload.create({
    collection: arrayFieldsSlug,
    data: arrayDoc,
    depth: 0,
    overrideAccess: true,
  })

  const createdTextDoc = await _payload.create({
    collection: textFieldsSlug,
    data: textDoc,
    depth: 0,
    overrideAccess: true,
  })

  await _payload.create({
    collection: textFieldsSlug,
    data: anotherTextDoc,
    depth: 0,
    overrideAccess: true,
  })

  const createdPNGDoc = await _payload.create({
    collection: uploadsSlug,
    data: {},
    file: pngFile,
    depth: 0,
    overrideAccess: true,
  })

  const createdJPGDoc = await _payload.create({
    collection: uploadsSlug,
    data: {
      ...uploadsDoc,
      media: createdPNGDoc.id,
    },
    file: jpgFile,
    depth: 0,
    overrideAccess: true,
  })

  const formattedID =
    _payload.db.defaultIDType === 'number' ? createdArrayDoc.id : `"${createdArrayDoc.id}"`

  const formattedJPGID =
    _payload.db.defaultIDType === 'number' ? createdJPGDoc.id : `"${createdJPGDoc.id}"`

  const formattedTextID =
    _payload.db.defaultIDType === 'number' ? createdTextDoc.id : `"${createdTextDoc.id}"`

  const richTextDocWithRelId = JSON.parse(
    JSON.stringify(richTextDocData)
      .replace(/"\{\{ARRAY_DOC_ID\}\}"/g, `${formattedID}`)
      .replace(/"\{\{UPLOAD_DOC_ID\}\}"/g, `${formattedJPGID}`)
      .replace(/"\{\{TEXT_DOC_ID\}\}"/g, `${formattedTextID}`),
  )
  const richTextBulletsDocWithRelId = JSON.parse(
    JSON.stringify(richTextBulletsDocData)
      .replace(/"\{\{ARRAY_DOC_ID\}\}"/g, `${formattedID}`)
      .replace(/"\{\{UPLOAD_DOC_ID\}\}"/g, `${formattedJPGID}`)
      .replace(/"\{\{TEXT_DOC_ID\}\}"/g, `${formattedTextID}`),
  )

  const richTextDocWithRelationship = { ...richTextDocWithRelId }

  await _payload.create({
    collection: richTextFieldsSlug,
    data: richTextBulletsDocWithRelId,
    depth: 0,
    overrideAccess: true,
  })

  const createdRichTextDoc = await _payload.create({
    collection: richTextFieldsSlug,
    data: richTextDocWithRelationship,
    depth: 0,
    overrideAccess: true,
  })

  const formattedRichTextDocID =
    _payload.db.defaultIDType === 'number' ? createdRichTextDoc.id : `"${createdRichTextDoc.id}"`

  const lexicalDocWithRelId = JSON.parse(
    JSON.stringify(lexicalDocData)
      .replace(/"\{\{ARRAY_DOC_ID\}\}"/g, `${formattedID}`)
      .replace(/"\{\{UPLOAD_DOC_ID\}\}"/g, `${formattedJPGID}`)
      .replace(/"\{\{TEXT_DOC_ID\}\}"/g, `${formattedTextID}`)
      .replace(/"\{\{RICH_TEXT_DOC_ID\}\}"/g, `${formattedRichTextDocID}`),
  )

  const lexicalMigrateDocWithRelId = JSON.parse(
    JSON.stringify(lexicalMigrateDocData)
      .replace(/"\{\{ARRAY_DOC_ID\}\}"/g, `${formattedID}`)
      .replace(/"\{\{UPLOAD_DOC_ID\}\}"/g, `${formattedJPGID}`)
      .replace(/"\{\{TEXT_DOC_ID\}\}"/g, `${formattedTextID}`)
      .replace(/"\{\{RICH_TEXT_DOC_ID\}\}"/g, `${formattedRichTextDocID}`),
  )

  await _payload.create({
    collection: usersSlug,
    depth: 0,
    data: {
      email: devUser.email,
      password: devUser.password,
    },
    overrideAccess: true,
  })

  await _payload.create({
    collection: lexicalFieldsSlug,
    data: lexicalDocWithRelId,
    depth: 0,
    overrideAccess: true,
  })

  const lexicalLocalizedDoc1 = await _payload.create({
    collection: lexicalLocalizedFieldsSlug,
    data: {
      title: 'Localized Lexical en',
      lexicalBlocksLocalized: textToLexicalJSON({ text: 'English text' }),
      lexicalBlocksSubLocalized: generateLexicalLocalizedRichText(
        'Shared text',
        'English text in block',
      ) as any,
    },
    locale: 'en',
    depth: 0,
    overrideAccess: true,
  })

  await _payload.create({
    collection: lexicalRelationshipFieldsSlug,
    data: {
      richText: textToLexicalJSON({ text: 'English text' }),
    },
    depth: 0,
    overrideAccess: true,
  })

  await _payload.update({
    collection: lexicalLocalizedFieldsSlug,
    id: lexicalLocalizedDoc1.id,
    data: {
      title: 'Localized Lexical es',
      lexicalBlocksLocalized: textToLexicalJSON({ text: 'Spanish text' }),
      lexicalBlocksSubLocalized: generateLexicalLocalizedRichText(
        'Shared text',
        'Spanish text in block',
        (lexicalLocalizedDoc1.lexicalBlocksSubLocalized.root.children[1].fields as any).id,
      ) as any,
    },
    locale: 'es',
    depth: 0,
    overrideAccess: true,
  })

  const lexicalLocalizedDoc2 = await _payload.create({
    collection: lexicalLocalizedFieldsSlug,
    data: {
      title: 'Localized Lexical en 2',

      lexicalBlocksLocalized: textToLexicalJSON({
        text: 'English text 2',
        lexicalLocalizedRelID: lexicalLocalizedDoc1.id,
      }),
      lexicalBlocksSubLocalized: textToLexicalJSON({
        text: 'English text 2',
        lexicalLocalizedRelID: lexicalLocalizedDoc1.id,
      }),
    },
    locale: 'en',
    depth: 0,
    overrideAccess: true,
  })

  await _payload.update({
    collection: lexicalLocalizedFieldsSlug,
    id: lexicalLocalizedDoc2.id,
    data: {
      title: 'Localized Lexical es 2',

      lexicalBlocksLocalized: textToLexicalJSON({
        text: 'Spanish text 2',
        lexicalLocalizedRelID: lexicalLocalizedDoc1.id,
      }),
    },
    locale: 'es',
    depth: 0,
    overrideAccess: true,
  })

  await _payload.create({
    collection: lexicalMigrateFieldsSlug,
    data: lexicalMigrateDocWithRelId,
    depth: 0,
    overrideAccess: true,
  })

  const getInlineBlock = () => ({
    type: 'inlineBlock',
    fields: {
      id: Math.random().toString(36).substring(2, 15),
      text: 'text',
      blockType: 'inlineBlockInLexical',
    },
    version: 1,
  })

  await _payload.create({
    collection: 'LexicalInBlock',
    depth: 0,
    data: {
      content: {
        root: {
          children: [
            {
              format: '',
              type: 'block',
              version: 2,
              fields: {
                id: '6773773284be8978db7a498d',
                lexicalInBlock: textToLexicalJSON({ text: 'text' }),
                blockName: '',
                blockType: 'blockInLexical',
              },
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
      blocks: [
        {
          blockType: 'lexicalInBlock2',
          blockName: '1',
          lexical: textToLexicalJSON({ text: '1' }),
        },
        {
          blockType: 'lexicalInBlock2',
          blockName: '2',
          lexical: textToLexicalJSON({ text: '2' }),
        },
        {
          blockType: 'lexicalInBlock2',
          lexical: {
            root: {
              children: [
                {
                  children: [...Array.from({ length: 20 }, () => getInlineBlock())],
                  direction: null,
                  format: '',
                  indent: 0,
                  type: 'paragraph',
                  version: 1,
                  textFormat: 0,
                  textStyle: '',
                },
              ],
              direction: null,
              format: '',
              indent: 0,
              type: 'root',
              version: 1,
            },
          },
          id: '67e1af0b78de3228e23ef1d5',
          blockName: '1',
        },
      ],
    },
  })

  await _payload.create({
    collection: 'lexical-access-control',
    data: {
      richText: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'text ',
                  type: 'text',
                  version: 1,
                },
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: 'link',
                      type: 'text',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'link',
                  version: 3,
                  fields: {
                    url: 'https://',
                    newTab: false,
                    linkType: 'custom',
                    blocks: [
                      {
                        id: '67e45673cbd5181ca8cbeef7',
                        blockType: 'block',
                      },
                    ],
                  },
                  id: '67e4566fcbd5181ca8cbeef5',
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
              textFormat: 0,
              textStyle: '',
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
      title: 'title',
    },
    depth: 0,
  })
}

export async function clearAndSeedEverything(_payload: Payload) {
  return await seedDB({
    _payload,
    collectionSlugs,
    seedFunction: seed,
    snapshotKey: 'lexicalTest',
    uploadsDir: path.resolve(dirname, './collections/Upload/uploads'),
  })
}
