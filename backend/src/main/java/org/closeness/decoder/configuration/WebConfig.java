package org.closeness.decoder.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final ClosenessDecoderInterceptor closenessDecoderInterceptor;

    public WebConfig(ClosenessDecoderInterceptor closenessDecoderInterceptor) {
        this.closenessDecoderInterceptor = closenessDecoderInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(closenessDecoderInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/**");
    }

}

