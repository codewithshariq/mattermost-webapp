// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount, shallow} from 'enzyme';

import SizeAwareImage from 'components/size_aware_image';
import LoadingImagePreview from 'components/loading_image_preview';

describe('components/SizeAwareImage', () => {
    const baseProps = {
        dimensions: {
            height: 200,
            width: 300,
        },
        onImageLoaded: jest.fn(),
        onImageLoadFail: jest.fn(),
        getFilePublicLink: jest.fn().mockReturnValue(Promise.resolve({data: {link: 'https://example.com/image.png'}})),
        src: 'https://example.com/image.png',
        className: 'class',
        fileInfo: {
            name: 'photo-1533709752211-118fcaf03312',
        },
        enablePublicLink: true,
    };

    test('should render an svg when first mounted with dimensions and img display set to none', () => {
        const wrapper = mount(<SizeAwareImage {...baseProps}/>);

        // since download and copy icons use svgs now, attachment svg should be searched as a direct child of image-loading__container
        const viewBox = wrapper.find('.image-loading__container').children().filter('svg').prop('viewBox');
        expect(viewBox).toEqual('0 0 300 200');
        const style = wrapper.find('.file-preview__button').prop('style');
        expect(style).toHaveProperty('display', 'none');
    });

    test('img should have inherited class name from prop', () => {
        const wrapper = mount(<SizeAwareImage {...{...baseProps, className: 'imgClass'}}/>);

        const className = wrapper.find('img').prop('className');
        expect(className).toEqual('imgClass');
    });

    test('should render a placeholder and has loader when showLoader is true', () => {
        const props = {
            ...baseProps,
            showLoader: true,
        };

        const wrapper = shallow(<SizeAwareImage {...props}/>);
        expect(wrapper.find(LoadingImagePreview).exists()).toEqual(true);
        expect(wrapper).toMatchSnapshot();
    });

    test('should have display set to initial in loaded state', () => {
        const wrapper = mount(<SizeAwareImage {...baseProps}/>);
        wrapper.setState({loaded: true, error: false});

        const style = wrapper.find('.file-preview__button').prop('style');
        expect(style).toHaveProperty('display', 'inline');
    });

    test('should render the actual image when first mounted without dimensions', () => {
        const props = {...baseProps};
        Reflect.deleteProperty(props, 'dimensions');

        const wrapper = mount(<SizeAwareImage {...props}/>);

        wrapper.setState({error: false});

        const src = wrapper.find('img').prop('src');
        expect(src).toEqual(baseProps.src);
    });

    test('should set loaded state when img loads and call onImageLoaded prop', () => {
        const height = 123;
        const width = 1234;

        const wrapper = shallow(<SizeAwareImage {...baseProps}/>);

        wrapper.find('img').prop('onLoad')({target: {naturalHeight: height, naturalWidth: width}});
        expect(wrapper.state('loaded')).toBe(true);
        expect(baseProps.onImageLoaded).toHaveBeenCalledWith({height, width});
    });

    test('should call onImageLoadFail when image load fails and should have svg', () => {
        const wrapper = mount(<SizeAwareImage {...baseProps}/>);

        wrapper.find('img').prop('onError')();

        expect(wrapper.state('error')).toBe(true);
        expect(wrapper.find('svg').exists()).toEqual(true);
        expect(wrapper.find(LoadingImagePreview).exists()).toEqual(false);
    });

    test('should match snapshot when handleSmallImageContainer prop is passed', () => {
        const props = {
            ...baseProps,
            handleSmallImageContainer: true,
        };

        const wrapper = shallow(<SizeAwareImage {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should surround the image with container div if the image is small', () => {
        const props = {
            ...baseProps,
            handleSmallImageContainer: true,
        };

        const wrapper = shallow(<SizeAwareImage {...props}/>);

        wrapper.instance().setState({isSmallImage: true});

        expect(wrapper.find('div.small-image__container').exists()).toEqual(true);
        expect(wrapper.find('div.small-image__container').prop('className')).
            toEqual('small-image__container cursor--pointer a11y--active');
    });

    test('should properly set container div width', () => {
        const props = {
            ...baseProps,
            handleSmallImageContainer: true,
        };

        const wrapper = shallow(<SizeAwareImage {...props}/>);

        wrapper.instance().setState({isSmallImage: true, imageWidth: 220});
        expect(wrapper.find('div.small-image__container').prop('style')).
            toHaveProperty('width', 222);

        wrapper.instance().setState({isSmallImage: true, imageWidth: 24});
        expect(wrapper.find('div.small-image__container').prop('style')).
            toEqual({});
        expect(wrapper.find('div.small-image__container').hasClass('small-image__container--min-width')).
            toEqual(true);
    });

    test('should properly set img style when it is small', () => {
        const props = {
            ...baseProps,
            handleSmallImageContainer: true,
        };

        const wrapper = shallow(<SizeAwareImage {...props}/>);

        wrapper.instance().setState({isSmallImage: true, imageWidth: 24});

        expect(wrapper.find('img').prop('className')).toBe(`${props.className} small-image--inside-container`);
    });

    test('should load download and copy link buttons when an image is mounted', () => {
        const fileURL = 'https://example.com/image.png';
        const props = {
            ...baseProps,
            fileURL,
        };
        const wrapper = shallow(<SizeAwareImage {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should load download hyperlink with href set to fileURL', () => {
        const fileURL = 'https://example.com/image.png';
        const props = {
            ...baseProps,
            fileURL,
        };
        const wrapper = shallow(<SizeAwareImage {...props}/>);
        expect(wrapper.find('.size-aware-image__download').prop('href')).toBe(fileURL);
    });

    test('clicking the copy button sets state.linkCopyInProgress to true', () => {
        const fileURL = 'https://example.com/image.png';
        const props = {
            ...baseProps,
            fileURL,
        };

        const wrapper = shallow(<SizeAwareImage {...props}/>);
        expect(wrapper.state('linkCopyInProgress')).toBe(false);
        wrapper.find('.size-aware-image__copy_link').first().simulate('click');
        expect(wrapper.state('linkCopyInProgress')).toBe(true);
    });

    test('does not render copy button if enablePublicLink is false', () => {
        const props = {
            ...baseProps,
            enablePublicLink: false,
        };

        const wrapper = shallow(<SizeAwareImage {...props}/>);
        expect(wrapper.find('button.size-aware-image__copy_link').exists()).toEqual(false);
    });
});
