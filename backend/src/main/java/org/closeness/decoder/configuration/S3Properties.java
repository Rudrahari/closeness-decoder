package org.closeness.decoder.configuration;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class S3Properties {
    @Value("${back-blaze.s3.endpoint}")
    private String endpoint;
    @Value("${back-blaze.s3.region}")
    private String region;
    @Value("${back-blaze.s3.access-key}")
    private String accessKey;
    @Value("${back-blaze.s3.secret-key}")
    private String secretKey;
    @Value("${back-blaze.s3.bucket}")
    private String bucketName;
}
