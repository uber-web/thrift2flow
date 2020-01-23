include "./service.thrift"

service ExtendingService extends service.RealService {}

service ExtendingServiceWithMethods extends service.RealService {
     i32 getNumberTwo(1: string a, 2: bool what)
}
