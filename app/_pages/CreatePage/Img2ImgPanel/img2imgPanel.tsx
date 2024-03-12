import React, { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from 'app/_components/Button'
import Image from 'app/_modules/Image'
import { SourceProcessing } from 'app/_utils/promptUtils'
import Head from 'next/head'
import Section from 'app/_components/Section'
import Uploader from 'app/_modules/Uploader'
import { IconPhotoUp, IconTrash } from '@tabler/icons-react'
import Samplers from 'app/_data-models/Samplers'
import { useInput } from 'app/_modules/InputProvider/context'
import { deleteImageFromDexie } from 'app/_utils/db'
import { DEXIE_JOB_ID } from '_constants'

interface Props {
  handleChangeInput: any
  handleImageUpload: any
  handleOrientationSelect: any
  saveForInpaint: any
}

const Img2ImgPanel = ({ saveForInpaint }: Props) => {
  const { input, setInput } = useInput()
  const router = useRouter()

  const handleSaveImage = ({
    imageType = '',
    source_image = '',
    height = 512,
    width = 512
  }) => {
    let sampler = input.sampler
    if (!Samplers.validSamplersForImg2Img().includes(sampler)) {
      sampler = 'k_dpm_2'
    }

    setInput({
      denoising_strength: input.denoising_strength ?? 0.75,
      img2img: true,
      imageType,
      height,
      width,
      orientationType: 'custom',
      sampler,
      source_image,
      source_processing: SourceProcessing.Img2Img
    })

    // setI2iUploaded({
    //   base64String: source_image,
    //   height,
    //   width
    // })

    // Attempt to store image between sessions.
    // localStorage.setItem('img2img_base64', source_image)
    // addImageToDexie({
    //   jobId: DEXIE_JOB_ID.SourceImage,
    //   base64String: source_image,
    //   hordeImageId: '',
    //   type: 'source-image',
    //   force: true
    // })
  }

  const handleInpaintClick = useCallback(() => {
    saveForInpaint({
      ...input
    })

    router.push('?panel=inpainting', { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input])

  return (
    <div>
      <Head>
        <title>img2img - ArtBot for Stable Diffusion</title>
        <meta
          name="twitter:title"
          content="img2img - ArtBot for Stable Diffusion"
        />
      </Head>
      <Section>
        {!input.source_image && (
          <Uploader handleSaveImage={handleSaveImage} type="img2img" />
        )}
        {input.source_image && (
          <>
            <div className="flex flex-row mb-4 gap-2">
              <Button
                theme="secondary"
                onClick={() => {
                  setInput({
                    img2img: false,
                    imageType: '',
                    source_image: '',
                    source_processing: SourceProcessing.Prompt
                  })
                  // clearI2IString()
                  deleteImageFromDexie(DEXIE_JOB_ID.SourceImage)
                }}
              >
                <IconTrash />
                Clear
              </Button>
              <Button onClick={handleInpaintClick}>
                <IconPhotoUp />
                Use Inpaint
              </Button>
            </div>
            <div className="flex flex-row align-top justify-around w-full mx-auto">
              <Image
                base64String={input.source_image}
                alt="Test"
                imageType={input.imageType}
                height={input.height}
                width={input.width}
                unsetDivDimensions
              />
            </div>
          </>
        )}
      </Section>
    </div>
  )
}

export default Img2ImgPanel
